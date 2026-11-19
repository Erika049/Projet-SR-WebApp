// Données d'exemple — tarifs, échéanciers, remises, paiements, reçus, déclarations, impayés, relances, caisse.
// Les soldes sont calculés côté API (CU-SYS-02) ; ici on les recalcule à partir des paiements.
import "server-only";
import type { Declaration, Eleve, ModePaiement, Paiement, SituationFinanciere, Tarif } from "@/types/domain";
import { ErreurMetier } from "../errors";
import { correspond, paginer } from "../pagination";
import { aujourdhui, db, journaliser, maintenant, nouvelId, notifier, ECOLE_ID } from "./db";
import { joursEntre } from "@/lib/format";

function tarifDe(e: Eleve): Tarif | undefined {
  const d = db();
  const niveau = d.classes.find((c) => c.id === e.classeId)?.niveau;
  return d.tarifs.find((t) => t.niveau === niveau);
}

export function situation(eleveId: string): SituationFinanciere | null {
  const d = db();
  const e = d.eleves.find((x) => x.id === eleveId);
  if (!e) return null;
  const t = tarifDe(e);
  const fraisAnnuels = t?.montant ?? 0;
  const tauxRemise = d.remises.find((r) => r.id === e.remiseId)?.taux ?? 0;
  const remise = Math.round((fraisAnnuels * tauxRemise) / 100);
  const totalDu = fraisAnnuels - remise;
  const paiements = d.paiements.filter((p) => p.eleveId === eleveId).sort((a, b) => b.date.localeCompare(a.date));
  const paye = paiements.filter((p) => p.statut !== "annule").reduce((s, p) => s + p.montant, 0);
  const jour = aujourdhui();
  // Montant échu = somme des versements dont la date limite est passée (au prorata de la remise)
  let cumul = 0;
  let premiereEcheanceImpayee: string | null = null;
  let prochaine: SituationFinanciere["prochaineEcheance"] = null;
  for (const v of t?.versements ?? []) {
    const montant = Math.round(v.montant * (1 - tauxRemise / 100));
    cumul += montant;
    if (v.dateLimite < jour && paye < cumul && !premiereEcheanceImpayee) premiereEcheanceImpayee = v.dateLimite;
    if (v.dateLimite >= jour && !prochaine && paye < cumul) prochaine = { libelle: v.libelle, montant: Math.min(montant, cumul - paye), dateLimite: v.dateLimite };
  }
  const echu = (t?.versements ?? []).filter((v) => v.dateLimite < jour).reduce((s, v) => s + Math.round(v.montant * (1 - tauxRemise / 100)), 0);
  const relances = d.relances.filter((r) => r.eleveId === eleveId).sort((a, b) => b.date.localeCompare(a.date));
  return {
    eleve: e,
    classe: d.classes.find((c) => c.id === e.classeId),
    fraisAnnuels,
    remise,
    totalDu,
    paye,
    solde: Math.max(0, totalDu - paye),
    montantEchu: Math.max(0, echu - paye),
    retardJours: premiereEcheanceImpayee ? joursEntre(premiereEcheanceImpayee, jour) : 0,
    prochaineEcheance: prochaine,
    paiements,
    declarations: d.declarations.filter((x) => x.eleveId === eleveId),
    derniereRelance: relances[0]?.date ?? null,
  };
}

export function rechercherEleves(q: string) {
  const d = db();
  if (!q) return [];
  return d.eleves
    .filter((e) => e.statut === "actif" && correspond(`${e.prenom} ${e.nom} ${e.nom} ${e.prenom} ${e.matricule}`, q))
    .slice(0, 12)
    .map((e) => situation(e.id)!);
}

// ---------- Impayés ----------
export function listerImpayes(f: { filtre?: string; page?: number; q?: string } = {}) {
  const d = db();
  const toutes = d.eleves
    .filter((e) => e.statut === "actif")
    .map((e) => situation(e.id)!)
    .filter((s) => s.montantEchu > 0)
    .sort((a, b) => b.retardJours - a.retardJours || b.montantEchu - a.montantEchu);
  const filtrees = toutes
    .filter((s) => (f.filtre === "7" ? s.retardJours > 7 : f.filtre === "30" ? s.retardJours > 30 : true))
    .filter((s) => correspond(`${s.eleve.prenom} ${s.eleve.nom} ${s.eleve.matricule}`, f.q ?? ""));
  const debutSemaine = new Date();
  debutSemaine.setDate(debutSemaine.getDate() - 7);
  return {
    ...paginer(filtrees, f.page),
    nombre: toutes.length,
    montant: toutes.reduce((s, x) => s + x.montantEchu, 0),
    plusDe30: toutes.filter((s) => s.retardJours > 30).length,
    plusDe7: toutes.filter((s) => s.retardJours > 7).length,
    relancesSemaine: d.relances.filter((r) => r.date >= debutSemaine.toISOString().slice(0, 10)).length,
  };
}

export function relancer(eleveIds: string[], acteur: string) {
  const d = db();
  for (const id of eleveIds) d.relances.push({ id: nouvelId("rel"), eleveId: id, date: maintenant(), canal: "sms" });
  journaliser(ECOLE_ID, acteur, "Relance envoyée", `${eleveIds.length} parent(s)`);
  return { n: eleveIds.length };
}

export function relancerTous(acteur: string) {
  const ids = listerImpayes({ page: 1 }).nombre ? db().eleves.filter((e) => e.statut === "actif").map((e) => situation(e.id)!).filter((s) => s.montantEchu > 0).map((s) => s.eleve.id) : [];
  return relancer(ids, acteur);
}

// ---------- Paiements ----------
export function enregistrerPaiement(data: { eleveId: string; montant: number; mode: ModePaiement; reference: string }, acteur: string, canal: Paiement["canal"] = "guichet") {
  const d = db();
  const s = situation(data.eleveId);
  if (!s) throw new ErreurMetier("Élève introuvable.", "Student not found.");
  if (data.montant <= 0) throw new ErreurMetier("Le montant doit être positif.", "Amount must be positive.");
  if (data.montant > s.solde) throw new ErreurMetier(`Le montant dépasse le solde restant (${s.solde} FCFA).`, `Amount exceeds the remaining balance (${s.solde} FCFA).`);
  if (data.mode !== "especes" && !data.reference) throw new ErreurMetier("La référence de transaction est obligatoire.", "Transaction reference is required.");
  const p: Paiement = {
    id: nouvelId("pai"),
    numeroRecu: d.prochainRecu(),
    eleveId: data.eleveId,
    montant: data.montant,
    mode: data.mode,
    reference: data.reference,
    date: maintenant(),
    encaissePar: acteur,
    canal,
    statut: "valide",
    motifAnnulation: null,
  };
  d.paiements.push(p);
  journaliser(ECOLE_ID, acteur, "Paiement enregistré", `${s.eleve.prenom} ${s.eleve.nom} · ${data.montant} FCFA`);
  return { id: p.id, numeroRecu: p.numeroRecu, solde: s.solde - data.montant };
}

export function paiement(id: string) {
  const d = db();
  const p = d.paiements.find((x) => x.id === id);
  if (!p) return null;
  return { paiement: p, situation: situation(p.eleveId)!, etablissement: d.etablissements.find((e) => e.id === ECOLE_ID)! };
}

export function demanderAnnulation(id: string, motif: string, acteur: string) {
  const p = db().paiements.find((x) => x.id === id);
  if (!p) throw new ErreurMetier("Paiement introuvable.", "Payment not found.");
  if (p.statut !== "valide") throw new ErreurMetier("Ce paiement ne peut plus être annulé.", "This payment can no longer be cancelled.");
  p.statut = "annulation_demandee";
  p.motifAnnulation = motif;
  notifier("direction", "finance", "Annulation de paiement à valider", `${p.numeroRecu} · ${motif}`, "/direction/finances");
  journaliser(ECOLE_ID, acteur, "Annulation de paiement demandée", `${p.numeroRecu} · ${motif}`);
}

export function traiterAnnulation(id: string, decision: "valider" | "refuser", acteur: string) {
  const p = db().paiements.find((x) => x.id === id);
  if (!p || p.statut !== "annulation_demandee") throw new ErreurMetier("Aucune annulation en attente.", "No pending cancellation.");
  p.statut = decision === "valider" ? "annule" : "valide";
  if (decision === "refuser") p.motifAnnulation = null;
  journaliser(ECOLE_ID, acteur, decision === "valider" ? "Paiement annulé" : "Annulation refusée", p.numeroRecu);
}

export function annulationsEnAttente() {
  const d = db();
  return d.paiements.filter((p) => p.statut === "annulation_demandee").map((p) => ({ paiement: p, eleve: d.eleves.find((e) => e.id === p.eleveId)! }));
}

export function envoyerRecu(id: string, acteur: string) {
  const p = db().paiements.find((x) => x.id === id);
  if (!p) throw new ErreurMetier("Paiement introuvable.", "Payment not found.");
  journaliser(ECOLE_ID, acteur, "Reçu envoyé au parent", p.numeroRecu);
}

// ---------- Déclarations des parents ----------
export function listerDeclarations() {
  const d = db();
  return d.declarations
    .filter((x) => x.statut === "en_attente")
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((x) => ({ ...x, eleve: d.eleves.find((e) => e.id === x.eleveId)!, classe: d.classes.find((c) => c.id === d.eleves.find((e) => e.id === x.eleveId)!.classeId)! }));
}

export function traiterDeclaration(id: string, decision: "valider" | "rejeter", acteur: string) {
  const d = db();
  const dec = d.declarations.find((x) => x.id === id);
  if (!dec || dec.statut !== "en_attente") throw new ErreurMetier("Déclaration introuvable ou déjà traitée.", "Declaration not found or already processed.");
  let recu: string | undefined;
  if (decision === "valider") {
    const s = situation(dec.eleveId)!;
    const montant = Math.min(dec.montant, s.solde || dec.montant);
    recu = enregistrerPaiement({ eleveId: dec.eleveId, montant, mode: dec.mode, reference: dec.reference }, acteur, "declaration").numeroRecu;
  }
  dec.statut = decision === "valider" ? "validee" : "rejetee";
  journaliser(ECOLE_ID, acteur, decision === "valider" ? "Déclaration validée" : "Déclaration rejetée", `${dec.parentNom} · ${dec.reference}`);
  return { recu };
}

// ---------- Tableaux de bord et rapports ----------
export function caisseDuJour(date = aujourdhui()) {
  const d = db();
  const paiements = d.paiements
    .filter((p) => p.date.startsWith(date) && p.statut !== "annule")
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((p) => {
      const e = d.eleves.find((x) => x.id === p.eleveId)!;
      return { ...p, eleve: e, classe: d.classes.find((c) => c.id === e.classeId)! };
    });
  const somme = (f: (p: Paiement) => boolean) => paiements.filter(f).reduce((s, p) => s + p.montant, 0);
  const compte = (f: (p: Paiement) => boolean) => paiements.filter(f).length;
  const mobile = (p: Paiement) => p.mode === "mtn_momo" || p.mode === "orange_money";
  return {
    date,
    paiements,
    especes: { montant: somme((p) => p.mode === "especes"), nombre: compte((p) => p.mode === "especes") },
    mobile: { montant: somme(mobile), nombre: compte(mobile) },
    virements: { montant: somme((p) => p.mode === "virement"), nombre: compte((p) => p.mode === "virement") },
    total: somme(() => true),
    cloture: d.cloturesCaisse.find((c) => c.date === date) ?? null,
  };
}

export function cloturerCaisse(acteur: string) {
  const d = db();
  const c = caisseDuJour();
  if (c.cloture) throw new ErreurMetier("La caisse du jour est déjà clôturée.", "Today's cash register is already closed.");
  d.cloturesCaisse.push({ date: c.date, especes: c.especes.montant, mobile: c.mobile.montant, autres: c.virements.montant, par: acteur, le: maintenant() });
  journaliser(ECOLE_ID, acteur, "Caisse clôturée", `${c.date} · ${c.total} FCFA`);
}

const MOIS = ["2026-09", "2026-10", "2026-11", "2026-12", "2027-01", "2027-02", "2027-03", "2027-04", "2027-05", "2027-06"];

export function rapportFinancier() {
  const d = db();
  const valides = d.paiements.filter((p) => p.statut !== "annule");
  const situations = d.eleves.filter((e) => e.statut === "actif").map((e) => situation(e.id)!);
  const attendu = situations.reduce((s, x) => s + x.totalDu, 0);
  const encaisse = valides.reduce((s, p) => s + p.montant, 0);
  const remises = situations.reduce((s, x) => s + x.remise, 0);
  const mois = MOIS.filter((m) => m <= aujourdhui().slice(0, 7)).map((m) => ({ mois: m, montant: valides.filter((p) => p.date.startsWith(m)).reduce((s, p) => s + p.montant, 0) }));
  const parMode = (["mtn_momo", "orange_money", "especes", "virement"] as ModePaiement[]).map((mode) => ({ mode, montant: valides.filter((p) => p.mode === mode).reduce((s, p) => s + p.montant, 0) }));
  const jours = [...new Set(valides.map((p) => p.date.slice(0, 10)))].sort().reverse().slice(0, 10).map((j) => {
    const c = caisseDuJour(j);
    return { date: j, especes: c.especes.montant, mobile: c.mobile.montant, autres: c.virements.montant, total: c.total, nombre: c.paiements.length, cloture: c.cloture };
  });
  return {
    attendu,
    encaisse,
    reste: Math.max(0, attendu - encaisse),
    remises,
    taux: attendu ? Math.round((encaisse / attendu) * 100) : 0,
    mois,
    parMode,
    jours,
    plusGrosImpayes: listerImpayes({ page: 1 }).items.slice(0, 5),
  };
}

export function derniersPaiements(n = 5) {
  const d = db();
  return [...d.paiements]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, n)
    .map((p) => {
      const e = d.eleves.find((x) => x.id === p.eleveId)!;
      return { ...p, eleve: e, classe: d.classes.find((c) => c.id === e.classeId)! };
    });
}

// ---------- Tarifs ----------
export function grilleTarifaire() {
  const d = db();
  return {
    tarifs: d.tarifs.map((t) => ({ ...t, eleves: d.eleves.filter((e) => e.statut === "actif" && d.classes.find((c) => c.id === e.classeId)?.niveau === t.niveau).length })),
    remises: d.remises,
  };
}

export function enregistrerTarif(t: Tarif, acteur: string) {
  const d = db();
  const total = t.versements.reduce((s, v) => s + v.montant, 0);
  if (total !== t.montant)
    throw new ErreurMetier(`La somme des versements (${total} FCFA) doit égaler les frais annuels (${t.montant} FCFA).`, `Instalments total (${total} FCFA) must equal annual fees (${t.montant} FCFA).`);
  const i = d.tarifs.findIndex((x) => x.niveau === t.niveau);
  if (i >= 0) d.tarifs[i] = t;
  else d.tarifs.push(t);
  notifier("comptable", "tarif", "Modification des tarifs", `Échéancier de ${t.niveau} mis à jour`);
  journaliser(ECOLE_ID, acteur, "Tarif modifié", `${t.niveau} · ${t.montant} FCFA`);
}

export function enregistrerRemise(data: { id?: string; libelle: string; taux: number }, acteur: string) {
  const d = db();
  const r = data.id ? d.remises.find((x) => x.id === data.id) : undefined;
  if (r) Object.assign(r, data);
  else d.remises.push({ id: nouvelId("rem"), libelle: data.libelle, taux: data.taux });
  journaliser(ECOLE_ID, acteur, "Remise enregistrée", `${data.libelle} · ${data.taux} %`);
}

export function appliquerRemise(eleveId: string, remiseId: string | null, acteur: string) {
  const d = db();
  const e = d.eleves.find((x) => x.id === eleveId);
  if (!e) throw new ErreurMetier("Élève introuvable.", "Student not found.");
  e.remiseId = remiseId;
  journaliser(ECOLE_ID, acteur, "Remise appliquée", `${e.prenom} ${e.nom} · ${d.remises.find((r) => r.id === remiseId)?.libelle ?? "aucune"}`);
}

export type { Declaration };
