// Données d'exemple — plateforme (super-admin) : établissements, abonnements, support, comptes, authentification.
import "server-only";
import type { Etablissement, Plan, Utilisateur } from "@/types/domain";
import { ErreurMetier } from "../errors";
import { correspond, paginer } from "../pagination";
import { aujourdhui, db, jour, journaliser, maintenant, nouvelId, MOT_DE_PASSE_DEMO } from "./db";
import { joursEntre } from "@/lib/format";

// ---------- Authentification ----------
export function authentifier(identifiant: string, motDePasse: string) {
  const id = identifiant.trim().toLowerCase().replace(/\s+/g, "");
  const u = db().utilisateurs.find((x) => x.email.toLowerCase() === id || x.telephone.replace(/\s+/g, "") === id);
  if (!u || u.motDePasse !== motDePasse) throw new ErreurMetier("Identifiant ou mot de passe incorrect.", "Incorrect username or password.");
  if (u.statut === "suspendu" || u.statut === "verrouille") throw new ErreurMetier("Ce compte est bloqué. Contactez votre établissement.", "This account is locked. Contact your school.");
  const etab = u.etablissementId ? db().etablissements.find((e) => e.id === u.etablissementId) : null;
  if (etab && (etab.statut === "suspendu" || etab.statut === "expire"))
    throw new ErreurMetier("L'accès de votre établissement est suspendu.", "Your school's access is suspended.");
  u.derniereConnexion = maintenant();
  u.statut = "actif";
  const { motDePasse: _mdp, ...sansMdp } = u;
  void _mdp;
  return { utilisateur: sansMdp as Utilisateur, etablissement: etab ?? null };
}

export function comptesDemo() {
  return db()
    .utilisateurs.filter((u) => ["usr-admin", "usr-nkeng", "usr-tchoua", "usr-owona", "usr-biloa"].includes(u.id))
    .map((u) => ({ email: u.email, role: u.role, nom: `${u.civilite} ${u.prenom} ${u.nom}`, motDePasse: MOT_DE_PASSE_DEMO }));
}

export function demanderReinitialisation(identifiant: string) {
  // En production : envoi d'un code OTP par SMS ou d'un lien par e-mail. On ne révèle jamais si le compte existe.
  void identifiant;
  return { envoye: true };
}

export function activerInvitation(token: string, motDePasse: string) {
  if (token.length < 6) throw new ErreurMetier("Lien d'invitation invalide ou expiré.", "Invalid or expired invitation link.");
  if (motDePasse.length < 8) throw new ErreurMetier("Le mot de passe doit contenir au moins 8 caractères.", "Password must be at least 8 characters.");
  return { ok: true };
}

export function changerMotDePasse(userId: string, actuel: string, nouveau: string) {
  const u = db().utilisateurs.find((x) => x.id === userId);
  if (!u || u.motDePasse !== actuel) throw new ErreurMetier("Mot de passe actuel incorrect.", "Current password is incorrect.");
  u.motDePasse = nouveau;
  journaliser(u.etablissementId, `${u.civilite} ${u.nom}`, "Mot de passe modifié", "");
}

export function utilisateur(id: string) {
  const u = db().utilisateurs.find((x) => x.id === id);
  if (!u) return null;
  const { motDePasse: _m, ...reste } = u;
  void _m;
  return reste as Utilisateur;
}

export function modifierProfil(id: string, data: { telephone: string; email: string; langue: "fr" | "en" }) {
  const u = db().utilisateurs.find((x) => x.id === id);
  if (!u) throw new ErreurMetier("Compte introuvable.", "Account not found.");
  Object.assign(u, data);
}

// ---------- Établissements ----------
const PRIX: Record<Plan, number> = { essai: 0, standard: 1500, premium: 2500 };

export function vueEnsemble() {
  const d = db();
  const e = d.etablissements;
  const dans30 = jour(30);
  const mois = [-4, -3, -2, -1, 0].map((dec) => {
    const dt = new Date();
    dt.setMonth(dt.getMonth() + dec);
    const cle = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    return { cle, n: e.filter((x) => x.creeLe.startsWith(cle)).length + [3, 5, 8, 6, 0][dec + 4] };
  });
  return {
    total: e.length,
    actifs: e.filter((x) => x.statut === "actif" || x.statut === "essai").length,
    eleves: e.reduce((s, x) => s + x.effectifEleves, 0),
    aRenouveler: e.filter((x) => x.finAbonnement >= aujourdhui() && x.finAbonnement <= dans30).length,
    ticketsOuverts: d.tickets.filter((t) => t.statut !== "resolu").length,
    ticketsUrgents: d.tickets.filter((t) => t.statut !== "resolu" && t.priorite === "urgent").length,
    nouveauxCeMois: mois.at(-1)!.n,
    parMois: mois,
    parPlan: (["essai", "standard", "premium"] as Plan[]).map((p) => ({ plan: p, n: e.filter((x) => x.plan === p).length })),
    renouvellements: e.filter((x) => x.finAbonnement <= dans30).sort((a, b) => a.finAbonnement.localeCompare(b.finAbonnement)).slice(0, 5),
    derniersTickets: d.tickets.filter((t) => t.statut !== "resolu").slice(0, 5).map((t) => ({ ...t, etablissement: e.find((x) => x.id === t.etablissementId)! })),
  };
}

export function listerEtablissements(f: { q?: string; statut?: string; page?: number }) {
  const items = db()
    .etablissements.filter((e) => correspond(`${e.nom} ${e.code} ${e.ville}`, f.q ?? ""))
    .filter((e) => !f.statut || e.statut === f.statut);
  return paginer(items, f.page);
}

export function etablissement(id: string) {
  const d = db();
  const e = d.etablissements.find((x) => x.id === id);
  if (!e) return null;
  return {
    ...e,
    directeur: d.utilisateurs.find((u) => u.id === e.directeurId) ?? null,
    utilisateurs: d.utilisateurs.filter((u) => u.etablissementId === id),
    activite: d.audit.filter((a) => a.etablissementId === id).slice(0, 15),
    tickets: d.tickets.filter((t) => t.etablissementId === id),
    montantAnnuel: PRIX[e.plan] * e.effectifEleves,
  };
}

export function prochainCode() {
  return `SC-${String(db().etablissements.length + 1).padStart(4, "0")}`;
}

export type DonneesEtablissement = {
  nom: string;
  type: Etablissement["type"];
  sousSysteme: Etablissement["sousSysteme"];
  region: string;
  ville: string;
  adresse: string;
  telephone: string;
  email: string;
  directeurCivilite: "M." | "Mme";
  directeurPrenom: string;
  directeurNom: string;
  directeurEmail: string;
  directeurTelephone: string;
  plan: Plan;
  debut: string;
  dureeMois: number;
};

export function finAbonnement(debut: string, dureeMois: number) {
  const [y, m, j] = debut.split("-").map(Number);
  const d = new Date(y, m - 1 + dureeMois, j - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function creerEtablissement(data: DonneesEtablissement, acteur: string) {
  const d = db();
  if (d.utilisateurs.some((u) => u.email.toLowerCase() === data.directeurEmail.toLowerCase()))
    throw new ErreurMetier("Ce courriel de directeur est déjà utilisé.", "This principal email is already in use.");
  const code = prochainCode();
  const id = `etab-${code.slice(3)}`;
  const directeur: Utilisateur & { motDePasse: string } = {
    id: nouvelId("usr"),
    civilite: data.directeurCivilite,
    prenom: data.directeurPrenom,
    nom: data.directeurNom,
    email: data.directeurEmail,
    telephone: data.directeurTelephone,
    role: "direction",
    etablissementId: id,
    statut: "invite",
    derniereConnexion: null,
    langue: "fr",
    motDePasse: MOT_DE_PASSE_DEMO,
  };
  const duree = data.plan === "essai" ? 2 : data.dureeMois;
  d.etablissements.push({
    id,
    code,
    nom: data.nom,
    ville: data.ville,
    region: data.region,
    type: data.type,
    sousSysteme: data.sousSysteme,
    adresse: data.adresse,
    telephone: data.telephone,
    email: data.email,
    plan: data.plan,
    statut: data.plan === "essai" ? "essai" : "actif",
    debutAbonnement: data.debut,
    finAbonnement: finAbonnement(data.debut, duree),
    effectifEleves: 0,
    effectifPersonnel: 0,
    parentsLies: 0,
    nbClasses: 0,
    directeurId: directeur.id,
    creeLe: aujourdhui(),
  });
  d.utilisateurs.push(directeur);
  journaliser(id, acteur, "Établissement créé", data.nom);
  return { id, code, fin: finAbonnement(data.debut, duree), directeur: `${data.directeurPrenom} ${data.directeurNom}`, email: data.directeurEmail };
}

function etab(id: string) {
  const e = db().etablissements.find((x) => x.id === id);
  if (!e) throw new ErreurMetier("Établissement introuvable.", "School not found.");
  return e;
}

export function changerStatutEtablissement(id: string, statut: "actif" | "suspendu", acteur: string) {
  const e = etab(id);
  e.statut = statut === "actif" && e.finAbonnement < aujourdhui() ? "expire" : statut;
  journaliser(id, acteur, statut === "suspendu" ? "Établissement suspendu" : "Établissement réactivé", e.nom);
}

export function prolongerAbonnement(id: string, mois: number, acteur: string, plan?: Plan) {
  const e = etab(id);
  const base = e.finAbonnement > aujourdhui() ? e.finAbonnement : aujourdhui();
  const [y, m, j] = base.split("-").map(Number);
  e.finAbonnement = finAbonnement(`${y}-${String(m).padStart(2, "0")}-${String(j + 1).padStart(2, "0")}`, mois);
  const etaitEssai = e.plan === "essai";
  if (plan) e.plan = plan;
  else if (etaitEssai) e.plan = "standard";
  if (e.statut === "expire" || e.statut === "essai" || e.statut === "suspendu") e.statut = "actif";
  journaliser(id, acteur, etaitEssai ? "Essai converti" : "Abonnement prolongé", `${e.nom} · ${mois} mois`);
}

export function abonnements(f: { filtre?: string; page?: number }) {
  const d = db();
  const dans30 = jour(30);
  const aujourd = aujourdhui();
  const statutAbo = (e: Etablissement) =>
    e.statut === "suspendu" ? "suspendu" : e.finAbonnement < aujourd ? "expire" : e.statut === "essai" ? "essai" : e.finAbonnement <= dans30 ? "a_renouveler" : "actif";
  const lignes = d.etablissements.map((e) => ({ ...e, statutAbonnement: statutAbo(e), joursRestants: joursEntre(aujourd, e.finAbonnement), montant: PRIX[e.plan] * e.effectifEleves }));
  return {
    ...paginer(lignes.filter((l) => !f.filtre || l.statutAbonnement === f.filtre), f.page),
    actifs: lignes.filter((l) => l.statutAbonnement === "actif" || l.statutAbonnement === "a_renouveler").length,
    aRenouveler: lignes.filter((l) => l.statutAbonnement === "a_renouveler").length,
    bloques: lignes.filter((l) => l.statutAbonnement === "expire" || l.statutAbonnement === "suspendu").length,
    revenuAnnuel: lignes.filter((l) => l.statutAbonnement !== "expire" && l.statutAbonnement !== "suspendu").reduce((s, l) => s + l.montant, 0),
    total: lignes.length,
  };
}

// ---------- Support ----------
export function listerTickets(statut?: string) {
  const d = db();
  return d.tickets
    .filter((t) => (statut === "resolu" ? t.statut === "resolu" : t.statut !== "resolu"))
    .sort((a, b) => (a.priorite === "urgent" ? -1 : 0) - (b.priorite === "urgent" ? -1 : 0) || b.creeLe.localeCompare(a.creeLe))
    .map((t) => ({ ...t, etablissement: d.etablissements.find((e) => e.id === t.etablissementId)! }));
}

export function ticket(id: string) {
  const d = db();
  const t = d.tickets.find((x) => x.id === id);
  return t ? { ...t, etablissement: d.etablissements.find((e) => e.id === t.etablissementId)! } : null;
}

export function repondreTicket(id: string, texte: string, acteur: string) {
  const t = db().tickets.find((x) => x.id === id);
  if (!t) throw new ErreurMetier("Ticket introuvable.", "Ticket not found.");
  t.messages.push({ auteur: "Support SchoolConnect", support: true, date: maintenant(), texte });
  t.statut = "repondu";
  journaliser(t.etablissementId, acteur, `Ticket #${t.numero} répondu`, db().etablissements.find((e) => e.id === t.etablissementId)?.nom ?? "");
}

export function resoudreTicket(id: string, acteur: string) {
  const t = db().tickets.find((x) => x.id === id);
  if (!t) throw new ErreurMetier("Ticket introuvable.", "Ticket not found.");
  t.statut = "resolu";
  journaliser(t.etablissementId, acteur, `Ticket #${t.numero} résolu`, "");
}

export function accesSupport(etablissementId: string, acteur: string) {
  const e = etab(etablissementId);
  journaliser(etablissementId, acteur, "Accès support (lecture seule)", e.nom);
}

// ---------- Comptes plateforme ----------
export function comptesPlateforme() {
  const d = db();
  return d.utilisateurs
    .filter((u) => u.role === "super_admin" || u.role === "direction")
    .map((u) => {
      const { motDePasse: _m, ...reste } = u;
      void _m;
      return { ...(reste as Utilisateur), etablissement: d.etablissements.find((e) => e.id === u.etablissementId) ?? null };
    });
}

export function actionCompte(userId: string, action: "reinitialiser" | "renvoyer" | "deverrouiller", acteur: string) {
  const u = db().utilisateurs.find((x) => x.id === userId);
  if (!u) throw new ErreurMetier("Compte introuvable.", "Account not found.");
  if (action === "deverrouiller") u.statut = "actif";
  const libelle = { reinitialiser: "Mot de passe réinitialisé", renvoyer: "Invitation renvoyée", deverrouiller: "Compte déverrouillé" }[action];
  journaliser(u.etablissementId, acteur, libelle, `${u.civilite} ${u.prenom} ${u.nom}`);
}
