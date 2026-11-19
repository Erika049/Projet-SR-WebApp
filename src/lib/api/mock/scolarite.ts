// Données d'exemple — scolarité : élèves, inscriptions, liaisons parents, corrections, classes, paramétrage.
import "server-only";
import type { Classe, Eleve, Matiere, ParametresEvaluation, Sequence, Trimestre } from "@/types/domain";
import { ErreurMetier } from "../errors";
import { correspond, paginer } from "../pagination";
import { aujourdhui, db, journaliser, maintenant, nouvelId, notifier, ECOLE_ID } from "./db";

// ---------- Classes ----------
export function listerClasses() {
  const d = db();
  return d.classes.map((c) => ({
    ...c,
    effectif: d.eleves.filter((e) => e.classeId === c.id && e.statut === "actif").length,
    titulaire: d.personnel.find((p) => p.id === c.titulaireId) ?? null,
    nbMatieres: d.matieres.filter((m) => (c.cycle === "premier" ? m.coefficientPremierCycle : m.coefficientSecondCycle) > 0).length,
  }));
}
export type ClasseDetaillee = ReturnType<typeof listerClasses>[number];

export function classe(id: string) {
  const c = listerClasses().find((x) => x.id === id);
  if (!c) return null;
  const d = db();
  const eleves = d.eleves.filter((e) => e.classeId === id && e.statut === "actif");
  const enseignants = d.personnel
    .filter((p) => p.affectations.some((a) => a.classeId === id))
    .map((p) => ({ personnel: p, affectation: p.affectations.find((a) => a.classeId === id)! }));
  return { ...c, eleves, enseignants };
}

export function creerClasse(data: { libelle: string; niveau: string; cycle: Classe["cycle"]; capacite: number; titulaireId: string | null; sousSysteme: Classe["sousSysteme"] }, acteur: string) {
  const d = db();
  if (d.classes.some((c) => c.libelle.toLowerCase() === data.libelle.toLowerCase()))
    throw new ErreurMetier("Une classe porte déjà ce nom.", "A class with this name already exists.");
  const c: Classe = { id: nouvelId("cls"), ...data };
  d.classes.push(c);
  journaliser(ECOLE_ID, acteur, "Classe créée", c.libelle);
  return c;
}

export function modifierClasse(id: string, data: { capacite: number; titulaireId: string | null }, acteur: string) {
  const c = db().classes.find((x) => x.id === id);
  if (!c) throw new ErreurMetier("Classe introuvable.", "Class not found.");
  Object.assign(c, data);
  journaliser(ECOLE_ID, acteur, "Classe modifiée", c.libelle);
}

// ---------- Élèves ----------
export type FiltreEleves = { q?: string; classeId?: string; liaison?: string; dossier?: string; page?: number; statut?: "actif" | "sorti" };

export function enrichir(e: Eleve) {
  const d = db();
  return { ...e, classe: d.classes.find((c) => c.id === e.classeId)!, dossierComplet: e.piecesManquantes.length === 0 };
}
export type EleveDetaille = ReturnType<typeof enrichir>;

export function listerEleves(f: FiltreEleves = {}) {
  const d = db();
  const items = d.eleves
    .filter((e) => e.statut === (f.statut ?? "actif"))
    .filter((e) => correspond(`${e.prenom} ${e.nom} ${e.nom} ${e.prenom} ${e.matricule} ${e.tuteur.nom}`, f.q ?? ""))
    .filter((e) => !f.classeId || e.classeId === f.classeId)
    .filter((e) => !f.liaison || e.liaison === f.liaison)
    .filter((e) => !f.dossier || (f.dossier === "incomplet" ? e.piecesManquantes.length > 0 : e.piecesManquantes.length === 0))
    .map(enrichir);
  return paginer(items, f.page);
}

/** Annuaire léger (listes déroulantes) : identifiant, nom, classe. */
export function annuaireEleves() {
  return db()
    .eleves.filter((e) => e.statut === "actif")
    .sort((a, b) => a.nom.localeCompare(b.nom))
    .map((e) => ({ id: e.id, nom: `${e.nom} ${e.prenom}`, matricule: e.matricule, classeId: e.classeId }));
}

export function statsEleves() {
  const d = db();
  const actifs = d.eleves.filter((e) => e.statut === "actif");
  return {
    total: actifs.length,
    classes: d.classes.length,
    lies: actifs.filter((e) => e.liaison === "liee").length,
    redoublants: actifs.filter((e) => e.redoublant).length,
    incomplets: actifs.filter((e) => e.piecesManquantes.length > 0).length,
    filles: actifs.filter((e) => e.sexe === "F").length,
    nouveauxMois: actifs.filter((e) => e.inscritLe >= aujourdhui().slice(0, 8) + "01").length,
  };
}

export function eleve(id: string) {
  const d = db();
  const e = d.eleves.find((x) => x.id === id);
  if (!e) return null;
  return {
    ...enrichir(e),
    corrections: d.corrections.filter((c) => c.eleveId === id).sort((a, b) => b.date.localeCompare(a.date)),
    demandesLiaison: d.demandesLiaison.filter((x) => x.eleveId === id),
    reinscription: d.reinscriptions[id] ?? null,
  };
}

export type DonneesInscription = {
  nom: string;
  prenom: string;
  sexe: "M" | "F";
  dateNaissance: string;
  lieuNaissance: string;
  classeId: string;
  tuteurNom: string;
  tuteurTelephone: string;
  tuteurLien: Eleve["tuteur"]["lien"];
};

function codeLiaison() {
  const a = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SC-${a}-${String(Math.floor(Math.random() * 90) + 10)}`;
}

export function inscrire(data: DonneesInscription, acteur: string, typeInscription: Eleve["typeInscription"] = "nouveau") {
  const d = db();
  const doublon = d.eleves.find(
    (e) => e.nom.toLowerCase() === data.nom.toLowerCase() && e.prenom.toLowerCase() === data.prenom.toLowerCase() && e.dateNaissance === data.dateNaissance,
  );
  if (doublon)
    throw new ErreurMetier(
      `Doublon détecté : ${doublon.prenom} ${doublon.nom} (${doublon.matricule}) existe déjà.`,
      `Duplicate detected: ${doublon.prenom} ${doublon.nom} (${doublon.matricule}) already exists.`,
    );
  const c = d.classes.find((x) => x.id === data.classeId);
  if (!c) throw new ErreurMetier("Classe inconnue.", "Unknown class.");
  const e: Eleve = {
    id: nouvelId("elv"),
    matricule: d.prochainMatriculeEleve(),
    nom: data.nom,
    prenom: data.prenom,
    sexe: data.sexe,
    dateNaissance: data.dateNaissance,
    lieuNaissance: data.lieuNaissance,
    nationalite: "Camerounaise",
    classeId: data.classeId,
    redoublant: false,
    statut: "actif",
    typeInscription,
    inscritLe: aujourdhui(),
    piecesManquantes: ["Acte de naissance", "Photo d'identité"],
    tuteur: { nom: data.tuteurNom, telephone: data.tuteurTelephone, lien: data.tuteurLien },
    codeLiaison: codeLiaison(),
    liaison: "non_liee",
    remiseId: null,
  };
  d.eleves.push(e);
  journaliser(ECOLE_ID, acteur, "Élève inscrit", `${e.prenom} ${e.nom} · ${c.libelle}`);
  return { id: e.id, matricule: e.matricule, codeLiaison: e.codeLiaison };
}

export function affecterClasse(id: string, classeId: string, acteur: string) {
  const d = db();
  const e = d.eleves.find((x) => x.id === id);
  const c = d.classes.find((x) => x.id === classeId);
  if (!e || !c) throw new ErreurMetier("Élève ou classe introuvable.", "Student or class not found.");
  const ancienne = d.classes.find((x) => x.id === e.classeId)!;
  if (ancienne.id === c.id) return;
  d.corrections.push({ id: nouvelId("cor"), eleveId: id, champ: "Classe", ancienneValeur: ancienne.libelle, nouvelleValeur: c.libelle, identite: false, statut: "appliquee", date: maintenant(), demandeur: acteur });
  e.classeId = classeId;
  journaliser(ECOLE_ID, acteur, "Classe corrigée", `${e.prenom} ${e.nom} · ${ancienne.libelle} → ${c.libelle}`);
}

const CHAMPS_IDENTITE = ["nom", "prenom", "dateNaissance", "lieuNaissance", "sexe"];
export const LIBELLE_CHAMP: Record<string, [string, string]> = {
  nom: ["Nom", "Last name"],
  prenom: ["Prénom", "First name"],
  dateNaissance: ["Date de naissance", "Date of birth"],
  lieuNaissance: ["Lieu de naissance", "Place of birth"],
  sexe: ["Sexe", "Sex"],
  tuteurNom: ["Nom du tuteur", "Guardian name"],
  tuteurTelephone: ["Téléphone du tuteur", "Guardian phone"],
};

function appliquerChamp(e: Eleve, champ: string, valeur: string) {
  if (champ === "tuteurNom") e.tuteur.nom = valeur;
  else if (champ === "tuteurTelephone") e.tuteur.telephone = valeur;
  else (e as unknown as Record<string, string>)[champ] = valeur;
}

/** Correction de dossier : les champs d'identité partent en validation chez le directeur, les autres s'appliquent. */
export function demanderCorrection(id: string, champ: string, valeur: string, acteur: string) {
  const d = db();
  const e = d.eleves.find((x) => x.id === id);
  if (!e) throw new ErreurMetier("Élève introuvable.", "Student not found.");
  const ancienne = champ === "tuteurNom" ? e.tuteur.nom : champ === "tuteurTelephone" ? e.tuteur.telephone : String((e as unknown as Record<string, string>)[champ] ?? "");
  const identite = CHAMPS_IDENTITE.includes(champ);
  d.corrections.push({
    id: nouvelId("cor"),
    eleveId: id,
    champ: LIBELLE_CHAMP[champ]?.[0] ?? champ,
    ancienneValeur: ancienne,
    nouvelleValeur: valeur,
    identite,
    statut: identite ? "attente_directeur" : "appliquee",
    date: maintenant(),
    demandeur: acteur,
  });
  if (!identite) appliquerChamp(e, champ, valeur);
  else notifier("direction", "correction", "Correction d'identité à valider", `${e.prenom} ${e.nom} · ${LIBELLE_CHAMP[champ]?.[0] ?? champ}`, "/direction/utilisateurs");
  journaliser(ECOLE_ID, acteur, identite ? "Correction d'identité demandée" : "Dossier corrigé", `${e.prenom} ${e.nom} · ${LIBELLE_CHAMP[champ]?.[0] ?? champ}`);
  return { identite };
}

export function listerCorrections(statut?: string) {
  const d = db();
  return d.corrections
    .filter((c) => !statut || c.statut === statut)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((c) => ({ ...c, eleve: enrichir(d.eleves.find((e) => e.id === c.eleveId)!) }));
}

const CHAMP_PAR_LIBELLE = Object.fromEntries(Object.entries(LIBELLE_CHAMP).map(([k, v]) => [v[0], k]));

export function traiterCorrection(id: string, decision: "accepter" | "refuser", acteur: string, parDirecteur: boolean) {
  const d = db();
  const c = d.corrections.find((x) => x.id === id);
  if (!c) throw new ErreurMetier("Demande introuvable.", "Request not found.");
  const e = d.eleves.find((x) => x.id === c.eleveId)!;
  if (decision === "refuser") {
    c.statut = "refusee";
  } else if (c.identite && !parDirecteur) {
    c.statut = "attente_directeur"; // le secrétariat transmet au directeur
    notifier("direction", "correction", "Correction d'identité à valider", `${e.prenom} ${e.nom} · ${c.champ}`, "/direction/utilisateurs");
  } else {
    c.statut = "appliquee";
    const champ = CHAMP_PAR_LIBELLE[c.champ];
    if (champ) {
      let valeur = c.nouvelleValeur;
      if (champ === "dateNaissance" && /^\d\d\/\d\d\/\d{4}$/.test(valeur)) valeur = valeur.split("/").reverse().join("-");
      appliquerChamp(e, champ, valeur);
    }
    if (parDirecteur) notifier("secretariat", "correction", "Correction acceptée", `Le directeur a validé : ${c.champ} de ${e.prenom} ${e.nom}`);
  }
  journaliser(ECOLE_ID, acteur, decision === "refuser" ? "Correction refusée" : "Correction validée", `${e.prenom} ${e.nom} · ${c.champ}`);
}

export function completerPiece(id: string, piece: string, acteur: string) {
  const e = db().eleves.find((x) => x.id === id);
  if (!e) throw new ErreurMetier("Élève introuvable.", "Student not found.");
  e.piecesManquantes = e.piecesManquantes.filter((p) => p !== piece);
  journaliser(ECOLE_ID, acteur, "Pièce reçue", `${e.prenom} ${e.nom} · ${piece}`);
}

export function regenererCode(id: string, acteur: string) {
  const e = db().eleves.find((x) => x.id === id);
  if (!e) throw new ErreurMetier("Élève introuvable.", "Student not found.");
  e.codeLiaison = codeLiaison();
  journaliser(ECOLE_ID, acteur, "Code de liaison régénéré", `${e.prenom} ${e.nom}`);
  return e.codeLiaison;
}

export function archiver(id: string, motif: string, acteur: string) {
  const e = db().eleves.find((x) => x.id === id);
  if (!e) throw new ErreurMetier("Élève introuvable.", "Student not found.");
  e.statut = "sorti";
  e.motifSortie = motif;
  journaliser(ECOLE_ID, acteur, "Dossier archivé", `${e.prenom} ${e.nom} · ${motif}`);
}

// ---------- Réinscriptions (année suivante) ----------
const NIVEAU_SUIVANT: Record<string, string> = { "6e": "5e", "5e": "4e", "4e": "3e", "3e": "2nde", "2nde": "1ère", "1ère": "Tle" };

export function listerReinscriptions(f: { q?: string; classeId?: string; page?: number }) {
  const d = db();
  const items = d.eleves
    .filter((e) => e.statut === "actif")
    .filter((e) => correspond(`${e.prenom} ${e.nom} ${e.matricule}`, f.q ?? ""))
    .filter((e) => !f.classeId || e.classeId === f.classeId)
    .map((e) => {
      const c = d.classes.find((x) => x.id === e.classeId)!;
      const r = d.reinscriptions[e.id];
      return { eleve: enrichir(e), niveauPropose: NIVEAU_SUIVANT[c.niveau] ?? null, reinscription: r ? { ...r, classe: d.classes.find((x) => x.id === r.classeId)! } : null };
    });
  const total = items.length;
  const faites = items.filter((i) => i.reinscription).length;
  return { ...paginer(items, f.page), faites, restantes: total - faites };
}

export function reinscrire(id: string, classeId: string, acteur: string) {
  const d = db();
  const e = d.eleves.find((x) => x.id === id);
  const c = d.classes.find((x) => x.id === classeId);
  if (!e || !c) throw new ErreurMetier("Élève ou classe introuvable.", "Student or class not found.");
  d.reinscriptions[id] = { classeId, date: aujourdhui() };
  journaliser(ECOLE_ID, acteur, "Réinscription 2027-2028", `${e.prenom} ${e.nom} · ${c.libelle}`);
}

// ---------- Import ----------
export type LigneImport = { ligne: number; nom: string; prenom: string; dateNaissance: string; sexe: string; classe: string; tuteurNom: string; tuteurTelephone: string; probleme: string | null };

export function analyserImport(contenu: string): LigneImport[] {
  const d = db();
  const lignes = contenu.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
  if (lignes.length === 0) return [];
  const sep = lignes[0].includes(";") ? ";" : ",";
  const debut = /nom/i.test(lignes[0]) ? 1 : 0;
  return lignes.slice(debut).map((l, i) => {
    const [nom = "", prenom = "", dateNaissance = "", sexe = "", classe = "", tuteurNom = "", tuteurTelephone = ""] = l.split(sep).map((x) => x.trim());
    let probleme: string | null = null;
    let date = dateNaissance;
    if (/^\d\d\/\d\d\/\d{4}$/.test(date)) date = date.split("/").reverse().join("-");
    if (!nom || !prenom) probleme = "Nom ou prénom manquant";
    else if (!/^\d{4}-\d\d-\d\d$/.test(date) || Number.isNaN(Date.parse(date))) probleme = "Date de naissance invalide";
    else if (!["M", "F"].includes(sexe.toUpperCase())) probleme = "Sexe invalide (M ou F)";
    else if (!d.classes.some((c) => c.libelle.toLowerCase() === classe.toLowerCase())) probleme = "Classe inconnue";
    else if (!tuteurTelephone) probleme = "Téléphone du tuteur manquant";
    return { ligne: i + 1 + debut, nom, prenom, dateNaissance: date, sexe: sexe.toUpperCase(), classe, tuteurNom, tuteurTelephone, probleme };
  });
}

export function importer(contenu: string, acteur: string) {
  const d = db();
  const lignes = analyserImport(contenu).filter((l) => !l.probleme);
  let importes = 0;
  const doublons: string[] = [];
  for (const l of lignes) {
    try {
      inscrire(
        { nom: l.nom, prenom: l.prenom, sexe: l.sexe as "M" | "F", dateNaissance: l.dateNaissance, lieuNaissance: "", classeId: d.classes.find((c) => c.libelle.toLowerCase() === l.classe.toLowerCase())!.id, tuteurNom: l.tuteurNom || `Tuteur de ${l.prenom}`, tuteurTelephone: l.tuteurTelephone, tuteurLien: "autre" },
        acteur,
      );
      importes++;
    } catch {
      doublons.push(`${l.prenom} ${l.nom}`);
    }
  }
  notifier("secretariat", "import", "Import terminé", `${importes} ligne(s) importée(s)`);
  return { importes, doublons: doublons.length };
}

// ---------- Liaisons parents ----------
export function listerDemandesLiaison() {
  const d = db();
  return d.demandesLiaison
    .filter((x) => x.statut === "en_attente")
    .map((x) => ({ ...x, eleve: enrichir(d.eleves.find((e) => e.id === x.eleveId)!) }));
}

export function traiterLiaison(id: string, decision: "accepter" | "refuser", acteur: string) {
  const d = db();
  const dl = d.demandesLiaison.find((x) => x.id === id);
  if (!dl) throw new ErreurMetier("Demande introuvable.", "Request not found.");
  const e = d.eleves.find((x) => x.id === dl.eleveId)!;
  dl.statut = decision === "accepter" ? "acceptee" : "refusee";
  e.liaison = decision === "accepter" ? "liee" : e.liaison === "en_attente" ? "non_liee" : e.liaison;
  journaliser(ECOLE_ID, acteur, decision === "accepter" ? "Liaison parent acceptée" : "Liaison parent refusée", `${dl.parentNom} → ${e.prenom} ${e.nom}`);
}

// ---------- Paramétrage ----------
export function parametrage() {
  const d = db();
  return { annee: d.annee, trimestres: d.trimestres, sequences: d.sequences, calendrier: d.calendrier, evaluation: d.evaluation, matieres: d.matieres };
}

export function enregistrerAnnee(data: { libelle: string; debut: string; fin: string; regime: "trimestriel" | "semestriel" }, acteur: string) {
  Object.assign(db().annee, data);
  journaliser(ECOLE_ID, acteur, "Année scolaire modifiée", data.libelle);
}

export function modifierTrimestre(id: string, data: Pick<Trimestre, "debut" | "fin" | "statut">, acteur: string) {
  const t = db().trimestres.find((x) => x.id === id);
  if (!t) throw new ErreurMetier("Période introuvable.", "Term not found.");
  Object.assign(t, data);
  journaliser(ECOLE_ID, acteur, "Période modifiée", `Trimestre ${t.numero}`);
}

export function modifierSequence(numero: number, data: Pick<Sequence, "debut" | "fin" | "statut" | "saisieJusquau">, acteur: string) {
  const s = db().sequences.find((x) => x.numero === numero);
  if (!s) throw new ErreurMetier("Séquence introuvable.", "Sequence not found.");
  Object.assign(s, data);
  journaliser(ECOLE_ID, acteur, "Séquence modifiée", `Séquence ${numero}`);
}

export function enregistrerMatiere(data: Omit<Matiere, "id"> & { id?: string }, acteur: string) {
  const d = db();
  const existante = data.id ? d.matieres.find((m) => m.id === data.id) : undefined;
  if (existante) Object.assign(existante, data);
  else {
    if (d.matieres.some((m) => m.code === data.code)) throw new ErreurMetier("Ce code de matière existe déjà.", "This subject code already exists.");
    d.matieres.push({ ...data, id: nouvelId("mat") });
  }
  journaliser(ECOLE_ID, acteur, existante ? "Coefficients modifiés" : "Matière ajoutée", data.libelle);
}

export function ajouterEvenement(data: { libelle: string; debut: string; fin: string; type: "conge" | "examen" | "evenement" }, acteur: string) {
  db().calendrier.push({ id: nouvelId("cal"), ...data });
  db().calendrier.sort((a, b) => a.debut.localeCompare(b.debut));
  journaliser(ECOLE_ID, acteur, "Événement ajouté au calendrier", data.libelle);
}

export function supprimerEvenement(id: string, acteur: string) {
  const d = db();
  const ev = d.calendrier.find((x) => x.id === id);
  d.calendrier = d.calendrier.filter((x) => x.id !== id);
  if (ev) journaliser(ECOLE_ID, acteur, "Événement supprimé", ev.libelle);
}

export function enregistrerEvaluation(data: ParametresEvaluation, acteur: string) {
  Object.assign(db().evaluation, data);
  journaliser(ECOLE_ID, acteur, "Paramètres d'évaluation modifiés", "");
}

export function cloturerAnnee(acteur: string) {
  const d = db();
  d.annee.statut = "cloturee";
  d.trimestres.forEach((t) => (t.statut = "cloture"));
  d.sequences.forEach((s) => (s.statut = "cloturee"));
  journaliser(ECOLE_ID, acteur, "Année clôturée", d.annee.libelle);
}
