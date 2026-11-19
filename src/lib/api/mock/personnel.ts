// Données d'exemple — personnel, affectations, assiduité du personnel.
import "server-only";
import type { Affectation, Personnel, PresencePersonnel } from "@/types/domain";
import { ErreurMetier } from "../errors";
import { correspond, paginer } from "../pagination";
import { aujourdhui, db, journaliser, nouvelId, ECOLE_ID } from "./db";

export type FiltrePersonnel = { q?: string; categorie?: string; page?: number };

export function listerPersonnel(f: FiltrePersonnel = {}) {
  const d = db();
  const tous = d.personnel;
  const items = tous
    .filter((p) => !f.categorie || p.categorie === f.categorie)
    .filter((p) => correspond(`${p.prenom} ${p.nom} ${p.matricule} ${p.specialite}`, f.q ?? ""))
    .map((p) => ({ ...p, classes: p.affectations.map((a) => d.classes.find((c) => c.id === a.classeId)?.libelle ?? "") }));
  return {
    ...paginer(items, f.page),
    compteurs: {
      tous: tous.length,
      enseignant: tous.filter((p) => p.categorie === "enseignant").length,
      administration: tous.filter((p) => p.categorie === "administration").length,
      surveillance: tous.filter((p) => p.categorie === "surveillance").length,
      matieres: new Set(tous.filter((p) => p.categorie === "enseignant").map((p) => p.specialite)).size,
    },
  };
}

export function enseignants() {
  return db().personnel.filter((p) => p.categorie === "enseignant" && p.statut !== "suspendu").map((p) => ({ id: p.id, nom: `${p.civilite} ${p.nom}`, specialite: p.specialite }));
}

export function membre(id: string) {
  const d = db();
  const p = d.personnel.find((x) => x.id === id);
  if (!p) return null;
  return {
    ...p,
    affectationsDetaillees: p.affectations.map((a) => {
      const c = d.classes.find((x) => x.id === a.classeId)!;
      return { ...a, classe: c, titulaire: c.titulaireId === p.id };
    }),
    activite: d.audit.filter((a) => a.etablissementId === ECOLE_ID && (a.cible.includes(p.nom) || a.acteur.includes(p.nom))).slice(0, 10),
  };
}

export function prochainMatricule() {
  const max = Math.max(...db().personnel.map((p) => Number(p.matricule.slice(4)) || 0));
  return `PER-${String(max + 1).padStart(4, "0")}`;
}

export type DonneesMembre = {
  civilite: "M." | "Mme";
  prenom: string;
  nom: string;
  sexe: "M" | "F";
  dateNaissance: string;
  telephone: string;
  email: string;
  fonction: Personnel["fonction"];
  specialite: string;
  contrat: Personnel["contrat"];
  datePriseService: string;
  heuresSemaine: number;
  classeIds: string[];
  titulaireDe: string | null;
  creerCompte: boolean;
};

export function ajouterMembre(data: DonneesMembre, acteur: string) {
  const d = db();
  if (d.personnel.some((p) => p.email && p.email === data.email)) throw new ErreurMetier("Ce courriel est déjà utilisé.", "This email is already in use.");
  const categorie: Personnel["categorie"] = data.fonction === "enseignant" ? "enseignant" : data.fonction.startsWith("surveillant") ? "surveillance" : "administration";
  const p: Personnel = {
    id: nouvelId("per"),
    matricule: prochainMatricule(),
    civilite: data.civilite,
    prenom: data.prenom,
    nom: data.nom,
    sexe: data.sexe,
    dateNaissance: data.dateNaissance,
    telephone: data.telephone,
    email: data.email,
    fonction: data.fonction,
    categorie,
    specialite: data.specialite || "—",
    contrat: data.contrat,
    datePriseService: data.datePriseService,
    heuresSemaine: data.heuresSemaine,
    statut: "actif",
    congeJusquau: null,
    affectations: data.classeIds.map((classeId) => ({ classeId, matiere: data.specialite, heures: Math.max(1, Math.round(data.heuresSemaine / Math.max(1, data.classeIds.length))) })),
    compte: { acces: data.creerCompte ? (categorie === "enseignant" ? "mobile" : "web") : "aucun", invitation: data.creerCompte ? "envoyee" : "aucune", derniereConnexion: null },
    assiduiteMois: { heuresPrevues: 0, heuresEffectuees: 0, retards: 0, absences: 0, absencesNonJustifiees: 0 },
  };
  d.personnel.push(p);
  if (data.titulaireDe) {
    const c = d.classes.find((x) => x.id === data.titulaireDe);
    if (c) c.titulaireId = p.id;
  }
  journaliser(ECOLE_ID, acteur, "Membre du personnel ajouté", `${p.civilite} ${p.nom} · ${p.matricule}`);
  return { id: p.id, matricule: p.matricule };
}

export function modifierAffectations(id: string, affectations: Affectation[], acteur: string) {
  const p = db().personnel.find((x) => x.id === id);
  if (!p) throw new ErreurMetier("Membre introuvable.", "Staff member not found.");
  p.affectations = affectations;
  p.heuresSemaine = affectations.reduce((s, a) => s + a.heures, 0) || p.heuresSemaine;
  journaliser(ECOLE_ID, acteur, "Affectations modifiées", `${p.civilite} ${p.nom}`);
}

export function changerStatut(id: string, statut: Personnel["statut"], acteur: string, jusquau?: string) {
  const p = db().personnel.find((x) => x.id === id);
  if (!p) throw new ErreurMetier("Membre introuvable.", "Staff member not found.");
  p.statut = statut;
  p.congeJusquau = statut === "conge" ? (jusquau ?? null) : null;
  const action = statut === "conge" ? "Mise en congé" : statut === "suspendu" ? "Compte suspendu" : "Compte réactivé";
  journaliser(ECOLE_ID, acteur, action, `${p.civilite} ${p.nom}`);
}

export function renvoyerInvitation(id: string, acteur: string) {
  const p = db().personnel.find((x) => x.id === id);
  if (!p) throw new ErreurMetier("Membre introuvable.", "Staff member not found.");
  p.compte.invitation = "envoyee";
  if (p.compte.acces === "aucun") p.compte.acces = p.categorie === "enseignant" ? "mobile" : "web";
  journaliser(ECOLE_ID, acteur, "Invitation envoyée", `${p.civilite} ${p.nom}`);
}

// ---------- Assiduité du personnel ----------
export function assiduitePersonnel() {
  const d = db();
  const enseignants = d.personnel.filter((p) => p.categorie === "enseignant");
  const prevues = enseignants.reduce((s, p) => s + p.assiduiteMois.heuresPrevues, 0);
  const effectuees = enseignants.reduce((s, p) => s + p.assiduiteMois.heuresEffectuees, 0);
  const retards = d.personnel.reduce((s, p) => s + p.assiduiteMois.retards, 0);
  const absences = d.personnel.reduce((s, p) => s + p.assiduiteMois.absences, 0);
  const nonJustifiees = d.personnel.reduce((s, p) => s + p.assiduiteMois.absencesNonJustifiees, 0);
  const statut = (p: Personnel) =>
    p.statut === "conge" ? "conge" : p.assiduiteMois.absencesNonJustifiees > 0 || p.assiduiteMois.retards > 1 ? "a_suivre" : "assidu";
  return {
    taux: prevues ? Math.round((effectuees / prevues) * 100) : 100,
    retards,
    absences,
    nonJustifiees,
    enseignantsEnRetard: d.personnel.filter((p) => p.assiduiteMois.retards > 0).length,
    lignes: enseignants.map((p) => ({ ...p, suivi: statut(p) })),
    pointsAttention: d.personnel
      .filter((p) => statut(p) !== "assidu" || p.assiduiteMois.heuresPrevues - p.assiduiteMois.heuresEffectuees >= 6)
      .map((p) => ({ personnel: p, suivi: statut(p), aRattraper: p.assiduiteMois.heuresPrevues - p.assiduiteMois.heuresEffectuees })),
  };
}

export function presencesPersonnelDuJour() {
  const d = db();
  const jour = aujourdhui();
  const saisies = d.presencesPersonnel[jour] ?? {};
  return {
    date: jour,
    lignes: d.personnel.filter((p) => p.statut !== "suspendu").map((p) => ({ personnel: p, presence: (saisies[p.id] ?? null) as PresencePersonnel | null })),
  };
}

export function saisirPresencePersonnel(valeurs: Record<string, PresencePersonnel>, acteur: string) {
  const d = db();
  const jour = aujourdhui();
  const anciennes = d.presencesPersonnel[jour] ?? {};
  for (const [id, v] of Object.entries(valeurs)) {
    const p = d.personnel.find((x) => x.id === id);
    if (!p) continue;
    if (anciennes[id] !== v) {
      if (v === "A") { p.assiduiteMois.absences++; p.assiduiteMois.absencesNonJustifiees++; }
      if (v === "R") p.assiduiteMois.retards++;
      if (anciennes[id] === "A") { p.assiduiteMois.absences--; p.assiduiteMois.absencesNonJustifiees--; }
      if (anciennes[id] === "R") p.assiduiteMois.retards--;
    }
  }
  d.presencesPersonnel[jour] = { ...anciennes, ...valeurs };
  journaliser(ECOLE_ID, acteur, "Appel du personnel enregistré", jour);
}
