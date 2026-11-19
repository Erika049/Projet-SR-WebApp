// Accès au backend Spring Boot SchoolConnect (/api/v1) : toutes les données affichées par l'application web
// viennent de la base de données via ces fonctions. Documentation des routes : <serveur>/swagger-ui.html.
import "server-only";
import { getSession } from "@/lib/auth/session";
import { aujourdhuiIso } from "@/lib/format";
import type { StatutPresence } from "@/types/domain";
import { apiFetch } from "./client";
import { ApiError } from "./errors";

// ═════════════════════════════ Formats du backend ═════════════════════════════

export type EleveApi = { id: string; nom: string; prenom: string; sexe: "M" | "F"; dateNaissance?: string; lieuNaissance?: string | null };
export type UtilisateurApi = {
  id: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  email: string | null;
  langue: "fr" | "en";
  roles: { role: string; etablissementId: string | null }[];
};
export type Etablissement = {
  id: string;
  nom: string;
  code: string;
  type: string;
  sousSysteme: string;
  ordreEnseignement: string;
  region: string | null;
  departement: string | null;
  ville: string | null;
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  statut: string;
};
export type AnneeScolaire = { id: string; libelle: string; dateDebut: string; dateFin: string; courante: boolean; statut: string };
export type Periode = {
  id: string;
  anneeScolaireId: string;
  type: "SEQUENCE" | "TRIMESTRE" | "ANNUELLE";
  numero: number;
  dateDebut: string;
  dateFin: string;
  saisieOuverte: boolean;
  publiee: boolean;
};
export type Classe = { id: string; anneeScolaireId: string; nom: string; niveau: string; effectifMax: number | null };
export type Matiere = { id: string; nom: string; code: string; coefficientDefaut: number };
export type Membre = { utilisateurId: string; nom: string; prenom: string; telephone: string | null; email: string | null; roles: string[] };
export type Affectation = {
  id: string;
  classeId: string;
  classeNom: string | null;
  matiereId: string;
  matiereNom: string | null;
  enseignantId: string;
  enseignantNom: string | null;
};
export type Creneau = {
  id: string;
  classeId: string;
  classeNom: string | null;
  matiereId: string;
  matiereNom: string | null;
  enseignantId: string | null;
  enseignantNom: string | null;
  jourSemaine: number;
  heureDebut: string;
  heureFin: string;
  salle: string | null;
};
export type EleveRepertoire = {
  eleveId: string;
  inscriptionId: string;
  matricule: string;
  nom: string;
  prenom: string;
  sexe: "M" | "F";
  dateNaissance: string;
  lieuNaissance: string | null;
  classeId: string | null;
  classeNom: string | null;
  niveau: string | null;
  statut: string;
  dateInscription: string;
  liaison: "LIEE" | "EN_ATTENTE" | "NON_LIEE";
};
export type Tuteur = {
  id: string;
  utilisateurId: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  lien: string;
  statut: "EN_ATTENTE" | "VALIDE" | "REVOQUE";
  peutPayer: boolean;
  peutJustifier: boolean;
};
export type CodeLiaison = { code: string; lien: string; expireLe: string; utilise: boolean; expire: boolean };
export type DossierEleve = {
  eleve: EleveRepertoire;
  nationalite: string | null;
  typeInscription: string;
  redoublant: boolean;
  tuteurs: Tuteur[];
  codes: CodeLiaison[];
};
export type ResultatsClasse = {
  classeId: string;
  matieres: { id: string; nom: string | null; coefficient: number | null }[];
  eleves: {
    eleveId: string;
    matricule: string;
    nom: string;
    prenom: string;
    moyennes: Record<string, number>;
    moyenneGenerale: number | null;
    rang: number | null;
  }[];
};
export type EvenementPresence = {
  appelId: string;
  classeId: string;
  classeNom: string | null;
  eleveId: string;
  nom: string;
  prenom: string;
  statut: "ABSENT" | "RETARD" | "SORTIE_ANTICIPEE";
  heureArrivee: string | null;
  heureSortie: string | null;
  parentsNotifiesLe: string | null;
};
export type Frais = { id: string; anneeScolaireId: string; niveau: string; libelle: string; montant: number; dateEcheance: string };
export type ModePaiementApi = "ESPECES" | "MOBILE_MONEY" | "VIREMENT" | "CHEQUE";
export type PaiementApi = {
  id: string;
  eleveId: string;
  montant: number;
  mode: ModePaiementApi;
  reference: string | null;
  date: string;
  numeroRecu: string;
  statut: "VALIDE" | "ANNULE";
};
export type Situation = {
  eleveId: string;
  eleve: EleveApi;
  totalDu: number;
  totalPaye: number;
  solde: number;
  fraisApplicables: Frais[];
  paiements: PaiementApi[];
};
export type PaiementDetail = {
  id: string;
  eleveId: string;
  eleveNom: string;
  elevePrenom: string;
  classeNom: string | null;
  montant: number;
  mode: ModePaiementApi;
  reference: string | null;
  date: string;
  numeroRecu: string;
  statut: "VALIDE" | "ANNULE";
  encaissePar: string | null;
  motifAnnulation: string | null;
  annulePar: string | null;
  annuleLe: string | null;
};
export type Impaye = { eleveId: string; eleve: EleveApi; totalDu: number; totalPaye: number; solde: number };
export type RapportCaisse = { date: string; total: number; parMode: { mode: ModePaiementApi; total: number; nombre: number }[] };
export type Annonce = {
  id: string;
  titre: string;
  message: string;
  classeId: string | null;
  classeNom: string | null;
  auteur: string | null;
  destinataires: number;
  creeLe: string;
};

type StatutPresenceApi = "PRESENT" | "ABSENT" | "RETARD" | "SORTIE_ANTICIPEE";
type InscriptionApi = { id: string; eleveId: string; classeId: string; matricule: string; eleve: EleveApi };
type PresenceApi = { id: string; eleveId: string; statut: StatutPresenceApi; eleve: EleveApi | null; parentsNotifiesLe: string | null };
type AppelApi = {
  id: string;
  classeId: string;
  date: string;
  presences: PresenceApi[];
  classeNom: string | null;
  matiereNom: string | null;
  saisiParNom: string | null;
  soumisLe: string | null;
  statut: "A_TRAITER" | "TRAITE";
  traiteLe: string | null;
  traiteParNom: string | null;
};
type AppelResumeApi = {
  id: string;
  classeId: string;
  classeNom: string;
  date: string;
  matiereNom: string | null;
  saisiParNom: string | null;
  soumisLe: string | null;
  effectif: number;
  presents: number;
  absents: number;
  retards: number;
  aNotifier: number;
  statut: "A_TRAITER" | "TRAITE";
  traiteLe: string | null;
};
type ClasseAppelApi = { classeId: string; classeNom: string; niveau: string; effectif: number; appel: AppelResumeApi | null };
type FichierApi = { id: string; nom: string; typeMime: string; taille: number } | null;
type JustificatifApi = {
  id: string;
  eleveId: string;
  eleve: EleveApi | null;
  classeNom: string | null;
  dateDebut: string;
  dateFin: string;
  joursAbsence: number;
  motif: string;
  piece: FichierApi;
  statut: "EN_ATTENTE" | "ACCEPTE" | "REFUSE";
  commentaire: string | null;
  deposePar: { id: string; nom: string; telephone: string | null } | null;
  creeLe: string;
  traiteLe: string | null;
  traiteParNom: string | null;
};
type LiaisonApi = {
  id: string;
  eleveId: string;
  eleve: EleveApi;
  matricule: string | null;
  classe: string | null;
  parent: { id: string; nom: string; prenom: string; telephone: string | null; email: string | null } | null;
  lien: string;
  statut: string;
  creeLe: string;
};
type DeclarationApi = {
  id: string;
  eleveId: string;
  eleve: EleveApi | null;
  classeNom: string | null;
  montant: number;
  mode: ModePaiementApi;
  reference: string | null;
  datePaiement: string;
  preuve: FichierApi;
  statut: "EN_ATTENTE" | "VALIDEE" | "REJETEE";
  motifRejet: string | null;
  numeroRecu: string | null;
  declarePar: { id: string; nom: string; telephone: string | null } | null;
  creeLe: string;
  soldeEleve: number | null;
};

// ═════════════════════════════ Vues des écrans ═════════════════════════════

export type ClassePresenceVue = {
  classe: { id: string; libelle: string };
  taux: number | null;
  absents: number;
  retards: number;
  appelFait: boolean;
  aNotifier: number;
  realisePar: string | null;
};

export type FicheAVerifier = {
  appelId: string;
  classeId: string;
  classe: string;
  date: string;
  matiere: string | null;
  realisePar: string | null;
  soumisLe: string | null;
  absents: number;
  retards: number;
  aNotifier: number;
};

export type PresencesJourVue = {
  date: string;
  taux: number;
  absences: number;
  retards: number;
  aJustifier: number;
  parClasse: ClassePresenceVue[];
  aVerifier: FicheAVerifier[];
  appelsManquants: { id: string; libelle: string }[];
  semaine: { date: string; taux: number }[];
};

export type AppelClasseVue = {
  classe: { id: string; libelle: string };
  date: string;
  appel: {
    id: string;
    realisePar: string;
    matiere: string | null;
    soumisLe: string | null;
    statut: "a_traiter" | "traite";
    aNotifier: number;
    traiteLe: string | null;
    traitePar: string | null;
  } | null;
  eleves: { eleve: { id: string; nom: string; prenom: string; matricule: string }; statut: StatutPresence; notifie: boolean }[];
};

export type JustificatifVue = {
  id: string;
  eleveId: string;
  dateAbsence: string;
  heures: string;
  motif: string;
  piece: string | null;
  pieceUrl: string | null;
  statut: "en_attente" | "accepte" | "refuse";
  soumisLe: string;
  traitePar: string | null;
  commentaire: string | null;
  parent: string | null;
  eleve: { prenom: string; nom: string; classe: { libelle: string } };
};

export type DemandeLiaisonVue = {
  id: string;
  eleveId: string;
  parentNom: string;
  parentTelephone: string;
  date: string;
  eleve: { prenom: string; nom: string; classe: { libelle: string } };
};

export type DeclarationVue = {
  id: string;
  parentNom: string;
  parentTelephone: string | null;
  montant: number;
  mode: string;
  reference: string;
  date: string;
  preuveNom: string | null;
  preuveUrl: string | null;
  soldeEleve: number | null;
  eleve: { prenom: string; nom: string };
  classe: { libelle: string };
};

// ═════════════════════════════ Utilitaires ═════════════════════════════

/** Établissement de la session (personnel d'un établissement). */
export async function etablissement(): Promise<string> {
  const s = await getSession();
  if (!s?.etablissementId) throw new ApiError(403, "Aucun établissement n'est associé à ce compte.");
  return s.etablissementId;
}

const statutWeb = (s: StatutPresenceApi): StatutPresence => (s === "PRESENT" ? "present" : s === "ABSENT" ? "absent" : "retard");
const statutApi = (s: StatutPresence): StatutPresenceApi => (s === "present" ? "PRESENT" : s === "absent" ? "ABSENT" : "RETARD");

/** Lien de téléchargement d'un fichier protégé via le relais /api/fichiers (le jeton reste côté serveur). */
export const lienFichier = (chemin: string) => `/api/fichiers/${chemin.replace(/^\//, "")}`;

/** Mode de paiement du backend → clé des libellés (src/lib/labels.ts). */
export const MODES: Record<ModePaiementApi, string> = {
  ESPECES: "especes",
  MOBILE_MONEY: "mobile_money",
  VIREMENT: "virement",
  CHEQUE: "cheque",
};

const est404 = (e: unknown) => e instanceof ApiError && e.status === 404;

// ═════════════════════════════ Authentification et compte ═════════════════════════════

/** « 690 00 00 01 » → « +237690000001 » ; un email est laissé tel quel. */
export function normaliserIdentifiant(identifiant: string): string {
  const v = identifiant.trim();
  if (v.includes("@")) return v.toLowerCase();
  const chiffres = v.replace(/[^\d+]/g, "");
  if (/^\d{9}$/.test(chiffres)) return `+237${chiffres}`;
  if (/^237\d{9}$/.test(chiffres)) return `+${chiffres}`;
  return chiffres;
}

export async function connexion(identifiant: string, motDePasse: string) {
  const r = await apiFetch<{ token: string; user: UtilisateurApi }>("/auth/login", {
    method: "POST",
    body: { identifiant: normaliserIdentifiant(identifiant), motDePasse },
    jeton: "",
  });
  return { jeton: r.token, utilisateur: r.user };
}

export const moi = () => apiFetch<UtilisateurApi>("/auth/me");
export const modifierProfil = (data: { telephone?: string; email?: string; langue?: string }) =>
  apiFetch<UtilisateurApi>("/auth/me", { method: "PATCH", body: data });
export const changerMotDePasse = (actuel: string, nouveau: string) =>
  apiFetch<void>("/auth/me/mot-de-passe", { method: "PUT", body: { actuel, nouveau } });

export const demanderCode = (identifiant: string) =>
  apiFetch<void>("/auth/mot-de-passe-oublie", { method: "POST", body: { identifiant: normaliserIdentifiant(identifiant) }, jeton: "" });
export const verifierCode = (identifiant: string, code: string) =>
  apiFetch<{ jeton: string }>("/auth/mot-de-passe-oublie/verifier", {
    method: "POST",
    body: { identifiant: normaliserIdentifiant(identifiant), code },
    jeton: "",
  });
export const reinitialiserMotDePasse = (jeton: string, motDePasse: string) =>
  apiFetch<void>("/auth/mot-de-passe-oublie/reinitialiser", { method: "POST", body: { jeton, motDePasse }, jeton: "" });

// ═════════════════════════════ Plateforme (super-admin) ═════════════════════════════

export const listerEtablissements = () => apiFetch<Etablissement[]>("/etablissements");
export const getEtablissement = (id: string, jeton?: string) => apiFetch<Etablissement>(`/etablissements/${id}`, { jeton });
export const creerEtablissement = (data: Record<string, string | null>) =>
  apiFetch<Etablissement>("/etablissements", { method: "POST", body: data });

// ═════════════════════════════ Paramétrage ═════════════════════════════

export async function annees(etab?: string) {
  const E = etab ?? (await etablissement());
  return apiFetch<AnneeScolaire[]>(`/etablissements/${E}/annees-scolaires`);
}

/** Année scolaire courante (null si aucune n'est définie). */
export async function anneeCourante(etab?: string) {
  return (await annees(etab)).find((a) => a.courante) ?? null;
}

export async function creerAnnee(data: { libelle: string; dateDebut: string; dateFin: string; courante: boolean }, etab?: string) {
  const E = etab ?? (await etablissement());
  return apiFetch<AnneeScolaire>(`/etablissements/${E}/annees-scolaires`, { method: "POST", body: data });
}

export async function periodes(anneeId: string) {
  return apiFetch<Periode[]>(`/etablissements/${await etablissement()}/annees-scolaires/${anneeId}/periodes`);
}

export async function creerPeriode(anneeId: string, data: { type: string; numero: number; dateDebut: string; dateFin: string }) {
  return apiFetch<Periode>(`/etablissements/${await etablissement()}/annees-scolaires/${anneeId}/periodes`, { method: "POST", body: data });
}

export async function basculerSaisie(anneeId: string, periodeId: string, ouvrir: boolean) {
  return apiFetch<Periode>(
    `/etablissements/${await etablissement()}/annees-scolaires/${anneeId}/periodes/${periodeId}/${ouvrir ? "ouvrir" : "fermer"}`,
    { method: "PATCH" },
  );
}

/** Classes de l'année courante. */
export async function classes(etab?: string) {
  const E = etab ?? (await etablissement());
  const annee = await anneeCourante(E);
  if (!annee) return [];
  return apiFetch<Classe[]>(`/etablissements/${E}/classes`, { query: { anneeScolaireId: annee.id } });
}

export async function creerClasse(data: { anneeScolaireId: string; nom: string; niveau: string; effectifMax: number | null }) {
  return apiFetch<Classe>(`/etablissements/${await etablissement()}/classes`, { method: "POST", body: data });
}

export async function matieres() {
  return apiFetch<Matiere[]>(`/etablissements/${await etablissement()}/matieres`);
}

export async function creerMatiere(data: { nom: string; code: string; coefficientDefaut: number }) {
  return apiFetch<Matiere>(`/etablissements/${await etablissement()}/matieres`, { method: "POST", body: data });
}

// ═════════════════════════════ Personnel et enseignement ═════════════════════════════

export async function personnel(etab?: string) {
  return apiFetch<Membre[]>(`/etablissements/${etab ?? (await etablissement())}/personnel`);
}

export async function ajouterMembre(
  data: { prenom: string; nom: string; telephone: string | null; email: string | null; motDePasse: string | null; role: string },
  etab?: string,
) {
  return apiFetch<Membre>(`/etablissements/${etab ?? (await etablissement())}/personnel`, { method: "POST", body: data });
}

export async function affectations() {
  return apiFetch<Affectation[]>(`/etablissements/${await etablissement()}/affectations`);
}

export async function creerAffectation(data: { classeId: string; matiereId: string; enseignantId: string }) {
  return apiFetch(`/etablissements/${await etablissement()}/affectations`, { method: "POST", body: data });
}

export async function creneauxClasse(classeId: string) {
  return apiFetch<Creneau[]>(`/etablissements/${await etablissement()}/classes/${classeId}/creneaux`);
}

export async function creerCreneau(data: {
  classeId: string;
  matiereId: string;
  jourSemaine: number;
  heureDebut: string;
  heureFin: string;
  salle: string | null;
}) {
  return apiFetch<Creneau>(`/etablissements/${await etablissement()}/creneaux`, { method: "POST", body: data });
}

export async function supprimerCreneau(id: string) {
  return apiFetch<void>(`/etablissements/${await etablissement()}/creneaux/${id}`, { method: "DELETE" });
}

export async function resultats(classeId: string, periodeId?: string) {
  return apiFetch<ResultatsClasse>(`/etablissements/${await etablissement()}/classes/${classeId}/resultats`, {
    query: { periodeId },
  });
}

// ═════════════════════════════ Élèves ═════════════════════════════

export async function repertoire() {
  return apiFetch<EleveRepertoire[]>(`/etablissements/${await etablissement()}/repertoire-eleves`);
}

export async function dossier(eleveId: string): Promise<DossierEleve | null> {
  try {
    return await apiFetch<DossierEleve>(`/etablissements/${await etablissement()}/repertoire-eleves/${eleveId}`);
  } catch (e) {
    if (est404(e) || (e instanceof ApiError && e.status === 400)) return null;
    throw e;
  }
}

export async function inscrire(data: {
  nom: string;
  prenom: string;
  sexe: string;
  dateNaissance: string;
  lieuNaissance: string | null;
  nationalite: string | null;
  anneeScolaireId: string;
  classeId: string | null;
  matricule: string;
  type: string;
  redoublant: boolean;
}) {
  return apiFetch<InscriptionApi>(`/etablissements/${await etablissement()}/eleves`, { method: "POST", body: data });
}

export async function affecterClasse(eleveId: string, classeId: string) {
  return apiFetch(`/etablissements/${await etablissement()}/eleves/${eleveId}/classe`, { method: "PATCH", body: { classeId } });
}

/** Enregistre un tuteur : lien direct s'il a déjà un compte, sinon code de liaison à lui remettre. */
export async function enregistrerTuteur(
  eleveId: string,
  data: { nom: string; prenom: string; telephone: string | null; email: string | null; lien: string; peutPayer: boolean; peutJustifier: boolean },
) {
  return apiFetch<{ lienDirect: unknown | null; code: { code: string; expireLe: string } | null }>(
    `/etablissements/${await etablissement()}/eleves/${eleveId}/tuteurs`,
    { method: "POST", body: { ...data, telephone: data.telephone ? normaliserIdentifiant(data.telephone) : null } },
  );
}

// ═════════════════════════════ Présences et appels ═════════════════════════════

function fiche(a: AppelResumeApi): FicheAVerifier {
  return {
    appelId: a.id,
    classeId: a.classeId,
    classe: a.classeNom,
    date: a.date,
    matiere: a.matiereNom,
    realisePar: a.saisiParNom,
    soumisLe: a.soumisLe,
    absents: a.absents,
    retards: a.retards,
    aNotifier: a.aNotifier,
  };
}

/** Taux de présence d'une journée (null si aucun appel ce jour-là). */
function tauxJour(liste: ClasseAppelApi[]): number | null {
  const appels = liste.map((c) => c.appel).filter((a): a is AppelResumeApi => a !== null);
  const total = appels.reduce((s, a) => s + a.effectif, 0);
  if (!total) return null;
  return Math.round((appels.reduce((s, a) => s + a.effectif - a.absents, 0) / total) * 1000) / 10;
}

export function decalerJour(iso: string, jours: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + jours);
  return d.toISOString().slice(0, 10);
}

export async function presencesDuJour(avecSemaine = false): Promise<PresencesJourVue> {
  const E = await etablissement();
  const date = aujourdhuiIso();
  const semaine: { date: string; taux: number }[] = [];
  if (avecSemaine) {
    const jours = [6, 5, 4, 3, 2, 1].map((n) => decalerJour(date, -n));
    const res = await Promise.all(jours.map((j) => apiFetch<ClasseAppelApi[]>(`/etablissements/${E}/appels`, { query: { date: j } })));
    res.forEach((r, i) => {
      const t = tauxJour(r);
      if (t !== null) semaine.push({ date: jours[i], taux: t });
    });
  }
  const [liste, aTraiter, justificatifs] = await Promise.all([
    apiFetch<ClasseAppelApi[]>(`/etablissements/${E}/appels`, { query: { date } }),
    apiFetch<AppelResumeApi[]>(`/etablissements/${E}/appels/a-traiter`),
    apiFetch<JustificatifApi[]>(`/etablissements/${E}/justificatifs`),
  ]);
  let presents = 0;
  let total = 0;
  let absences = 0;
  let retards = 0;
  const parClasse = liste.map((c): ClassePresenceVue => {
    const a = c.appel;
    if (!a) return { classe: { id: c.classeId, libelle: c.classeNom }, taux: null, absents: 0, retards: 0, appelFait: false, aNotifier: 0, realisePar: null };
    presents += a.effectif - a.absents;
    total += a.effectif;
    absences += a.absents;
    retards += a.retards;
    return {
      classe: { id: c.classeId, libelle: c.classeNom },
      taux: a.effectif ? Math.round(((a.effectif - a.absents) / a.effectif) * 1000) / 10 : 100,
      absents: a.absents,
      retards: a.retards,
      appelFait: true,
      aNotifier: a.aNotifier,
      realisePar: a.saisiParNom,
    };
  });
  const taux = total ? Math.round((presents / total) * 1000) / 10 : 0;
  if (avecSemaine && total) semaine.push({ date, taux });
  return {
    date,
    taux,
    absences,
    retards,
    aJustifier: justificatifs.length,
    parClasse,
    aVerifier: aTraiter.map(fiche),
    appelsManquants: parClasse.filter((c) => !c.appelFait).map((c) => c.classe),
    semaine,
  };
}

export async function appelClasse(classeId: string, date = aujourdhuiIso()): Promise<AppelClasseVue | null> {
  const E = await etablissement();
  let eleves: InscriptionApi[];
  try {
    eleves = await apiFetch<InscriptionApi[]>(`/etablissements/${E}/classes/${classeId}/eleves`);
  } catch (e) {
    if (est404(e) || (e instanceof ApiError && e.status === 400)) return null;
    throw e;
  }
  let appel: AppelApi | null = null;
  try {
    appel = await apiFetch<AppelApi>(`/etablissements/${E}/classes/${classeId}/appels`, { query: { date } });
  } catch (e) {
    if (!est404(e)) throw e;
  }
  const parEleve = new Map((appel?.presences ?? []).map((p) => [p.eleveId, p]));
  const matricules = new Map(eleves.map((i) => [i.eleveId, i.matricule]));
  const liste = eleves.map((i) => ({ id: i.eleveId, nom: i.eleve.nom, prenom: i.eleve.prenom }));
  for (const p of appel?.presences ?? []) {
    if (p.eleve && !matricules.has(p.eleveId)) liste.push({ id: p.eleveId, nom: p.eleve.nom, prenom: p.eleve.prenom });
  }
  const libelle = appel?.classeNom ?? (await classes(E)).find((c) => c.id === classeId)?.nom ?? "Classe";
  return {
    classe: { id: classeId, libelle },
    date,
    appel: appel && {
      id: appel.id,
      realisePar: appel.saisiParNom ?? "—",
      matiere: appel.matiereNom,
      soumisLe: appel.soumisLe,
      statut: appel.statut === "A_TRAITER" ? "a_traiter" : "traite",
      aNotifier: appel.presences.filter((p) => p.statut !== "PRESENT" && !p.parentsNotifiesLe).length,
      traiteLe: appel.traiteLe,
      traitePar: appel.traiteParNom,
    },
    eleves: liste
      .sort((a, b) => `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`))
      .map((e) => {
        const p = parEleve.get(e.id);
        return {
          eleve: { ...e, matricule: matricules.get(e.id) ?? "" },
          statut: p ? statutWeb(p.statut) : "present",
          notifie: Boolean(p?.parentsNotifiesLe),
        };
      }),
  };
}

async function appelDuJour(E: string, classeId: string, date: string): Promise<AppelApi | null> {
  try {
    return await apiFetch<AppelApi>(`/etablissements/${E}/classes/${classeId}/appels`, { query: { date } });
  } catch (e) {
    if (est404(e)) return null;
    throw e;
  }
}

/**
 * Appel saisi ou corrigé par le surveillant général : les parents des absents sont prévenus aussitôt.
 * Retourne le nombre d'élèves dont les parents viennent d'être notifiés.
 */
export async function enregistrerAppel(classeId: string, statuts: Record<string, StatutPresence>) {
  const E = await etablissement();
  const date = aujourdhuiIso();
  const base = `/etablissements/${E}/classes/${classeId}/appels`;
  const existant = await appelDuJour(E, classeId, date);
  const debut = Date.now();
  let resultat: AppelApi;
  if (!existant) {
    const presences = Object.entries(statuts)
      .filter(([, s]) => s !== "present")
      .map(([eleveId, s]) => ({ eleveId, statut: statutApi(s) }));
    resultat = await apiFetch<AppelApi>(base, { method: "POST", body: { date, presences } });
  } else {
    const avant = new Map(existant.presences.map((p) => [p.eleveId, statutWeb(p.statut)]));
    const presences = Object.entries(statuts)
      .filter(([eleveId, s]) => avant.has(eleveId) && avant.get(eleveId) !== s)
      .map(([eleveId, s]) => ({ eleveId, statut: statutApi(s) }));
    resultat = presences.length
      ? await apiFetch<AppelApi>(`${base}/${existant.id}`, { method: "PATCH", body: { presences } })
      : (await apiFetch<{ appel: AppelApi }>(`${base}/${existant.id}/notifier-parents`, { method: "POST" })).appel;
  }
  const notifies = resultat.presences.filter(
    (p) => p.statut !== "PRESENT" && p.parentsNotifiesLe && new Date(p.parentsNotifiesLe).getTime() >= debut - 5000,
  ).length;
  return { notifies };
}

export async function notifierParents(classeId: string, appelId: string) {
  const E = await etablissement();
  return apiFetch<{ elevesConcernes: number; notificationsEnvoyees: number; elevesSansParent: number }>(
    `/etablissements/${E}/classes/${classeId}/appels/${appelId}/notifier-parents`,
    { method: "POST" },
  );
}

/** Absences, retards et sorties anticipées d'une journée. */
export async function evenementsPresence(date = aujourdhuiIso()) {
  return apiFetch<EvenementPresence[]>(`/etablissements/${await etablissement()}/presences`, { query: { date } });
}

/**
 * Retard ou sortie anticipée constaté par la surveillance : l'appel du jour de la classe est complété
 * (ou créé), et les parents sont prévenus.
 */
export async function enregistrerRetardSortie(eleveId: string, classeId: string, type: "retard" | "sortie", heure: string) {
  const E = await etablissement();
  const date = aujourdhuiIso();
  const base = `/etablissements/${E}/classes/${classeId}/appels`;
  const saisie = {
    eleveId,
    statut: type === "retard" ? "RETARD" : "SORTIE_ANTICIPEE",
    heureArrivee: type === "retard" ? heure : null,
    heureSortie: type === "sortie" ? heure : null,
  };
  const existant = await appelDuJour(E, classeId, date);
  if (existant) {
    await apiFetch(`${base}/${existant.id}`, { method: "PATCH", body: { presences: [saisie] } });
  } else {
    await apiFetch(base, { method: "POST", body: { date, presences: [saisie] } });
  }
}

// ═════════════════════════════ Justificatifs ═════════════════════════════

export async function listerJustificatifs(statut: "en_attente" | "traites"): Promise<JustificatifVue[]> {
  const E = await etablissement();
  const liste = await apiFetch<JustificatifApi[]>(`/etablissements/${E}/justificatifs`, { query: { traites: statut === "traites" } });
  return liste.map((j) => ({
    id: j.id,
    eleveId: j.eleveId,
    dateAbsence: j.dateDebut,
    heures: j.dateFin !== j.dateDebut ? `→ ${j.dateFin.split("-").reverse().slice(0, 2).join("/")}` : "journée",
    motif: j.motif,
    piece: j.piece?.nom ?? null,
    pieceUrl: j.piece ? lienFichier(`etablissements/${E}/justificatifs/${j.id}/piece`) : null,
    statut: j.statut === "EN_ATTENTE" ? "en_attente" : j.statut === "ACCEPTE" ? "accepte" : "refuse",
    soumisLe: j.creeLe,
    traitePar: j.traiteParNom,
    commentaire: j.commentaire,
    parent: j.deposePar?.nom ?? null,
    eleve: { prenom: j.eleve?.prenom ?? "", nom: j.eleve?.nom ?? "", classe: { libelle: j.classeNom ?? "—" } },
  }));
}

export async function traiterJustificatif(id: string, decision: "accepte" | "refuse", commentaire?: string) {
  const E = await etablissement();
  await apiFetch(`/etablissements/${E}/justificatifs/${id}`, {
    method: "PATCH",
    body: { decision: decision === "accepte" ? "ACCEPTE" : "REFUSE", commentaire: commentaire?.trim() || null },
  });
}

// ═════════════════════════════ Liaisons parent-enfant ═════════════════════════════

export async function listerDemandesLiaison(): Promise<DemandeLiaisonVue[]> {
  const E = await etablissement();
  const liste = await apiFetch<LiaisonApi[]>(`/etablissements/${E}/liaisons`);
  return liste.map((l) => ({
    id: l.id,
    eleveId: l.eleveId,
    parentNom: l.parent ? `${l.parent.prenom} ${l.parent.nom}` : "Parent",
    parentTelephone: l.parent?.telephone ?? l.parent?.email ?? "",
    date: l.creeLe,
    eleve: { prenom: l.eleve.prenom, nom: l.eleve.nom, classe: { libelle: l.classe ?? "—" } },
  }));
}

export async function traiterLiaison(id: string, eleveId: string, decision: "accepter" | "refuser") {
  const E = await etablissement();
  await apiFetch(`/etablissements/${E}/eleves/${eleveId}/tuteurs/${id}/${decision === "accepter" ? "valider" : "rejeter"}`, {
    method: "PATCH",
  });
}

// ═════════════════════════════ Finances ═════════════════════════════

export async function frais(anneeId: string) {
  return apiFetch<Frais[]>(`/etablissements/${await etablissement()}/annees-scolaires/${anneeId}/frais-scolaires`);
}

export async function creerFrais(anneeId: string, data: { niveau: string; libelle: string; montant: number; dateEcheance: string }) {
  return apiFetch<Frais>(`/etablissements/${await etablissement()}/annees-scolaires/${anneeId}/frais-scolaires`, {
    method: "POST",
    body: data,
  });
}

export async function situation(eleveId: string): Promise<Situation | null> {
  try {
    return await apiFetch<Situation>(`/etablissements/${await etablissement()}/eleves/${eleveId}/situation-financiere`);
  } catch (e) {
    if (est404(e) || (e instanceof ApiError && e.status === 400)) return null;
    throw e;
  }
}

export async function enregistrerPaiement(
  eleveId: string,
  data: { montant: number; mode: ModePaiementApi; reference: string | null; date: string },
) {
  return apiFetch<PaiementApi>(`/etablissements/${await etablissement()}/eleves/${eleveId}/paiements`, { method: "POST", body: data });
}

export async function annulerPaiement(eleveId: string, paiementId: string, motif: string) {
  return apiFetch<PaiementApi>(`/etablissements/${await etablissement()}/eleves/${eleveId}/paiements/${paiementId}/annuler`, {
    method: "PATCH",
    body: { motif },
  });
}

export async function journalCaisse(du: string, au: string) {
  return apiFetch<PaiementDetail[]>(`/etablissements/${await etablissement()}/paiements`, { query: { du, au } });
}

export async function paiement(id: string): Promise<PaiementDetail | null> {
  try {
    return await apiFetch<PaiementDetail>(`/etablissements/${await etablissement()}/paiements/${id}`);
  } catch (e) {
    if (est404(e) || (e instanceof ApiError && e.status === 400)) return null;
    throw e;
  }
}

export async function impayes() {
  return apiFetch<Impaye[]>(`/etablissements/${await etablissement()}/impayes`);
}

export async function relancerImpayes(eleveIds?: string[]) {
  return apiFetch<{ elevesEnImpaye: number; elevesRelances: number; notificationsEnvoyees: number; elevesSansParentLie: number }>(
    `/etablissements/${await etablissement()}/impayes/relances`,
    { method: "POST", body: eleveIds ? { eleveIds } : {} },
  );
}

export async function rapportCaisse(date: string) {
  return apiFetch<RapportCaisse>(`/etablissements/${await etablissement()}/rapport-caisse`, { query: { date } });
}

export async function listerDeclarations(): Promise<DeclarationVue[]> {
  const E = await etablissement();
  const liste = await apiFetch<DeclarationApi[]>(`/etablissements/${E}/declarations-paiement`);
  return liste.map((d) => ({
    id: d.id,
    parentNom: d.declarePar?.nom ?? "Parent",
    parentTelephone: d.declarePar?.telephone ?? null,
    montant: Number(d.montant),
    mode: MODES[d.mode],
    reference: d.reference ?? "—",
    date: d.datePaiement,
    preuveNom: d.preuve?.nom ?? null,
    preuveUrl: d.preuve ? lienFichier(`etablissements/${E}/declarations-paiement/${d.id}/preuve`) : null,
    soldeEleve: d.soldeEleve === null ? null : Number(d.soldeEleve),
    eleve: { prenom: d.eleve?.prenom ?? "", nom: d.eleve?.nom ?? "" },
    classe: { libelle: d.classeNom ?? "—" },
  }));
}

export async function traiterDeclaration(id: string, decision: "valider" | "rejeter", motif?: string) {
  const E = await etablissement();
  await apiFetch(`/etablissements/${E}/declarations-paiement/${id}/${decision}`, {
    method: "PATCH",
    body: decision === "rejeter" ? { motif: motif?.trim() || "Paiement introuvable sur le relevé de l'opérateur ou de la banque." } : undefined,
  });
}

// ═════════════════════════════ Annonces ═════════════════════════════

export async function annonces() {
  return apiFetch<Annonce[]>(`/etablissements/${await etablissement()}/annonces`);
}

export async function publierAnnonce(data: { titre: string; message: string; classeId: string | null }) {
  return apiFetch<Annonce>(`/etablissements/${await etablissement()}/annonces`, { method: "POST", body: data });
}

// ═════════════════════════════ Menu ═════════════════════════════

/** Compteurs du menu latéral (tâches en attente pour le rôle). */
export async function compteursMenu(role: string): Promise<Record<string, number>> {
  const E = await etablissement();
  switch (role) {
    case "surveillant": {
      const [j, a] = await Promise.all([
        apiFetch<unknown[]>(`/etablissements/${E}/justificatifs`),
        apiFetch<unknown[]>(`/etablissements/${E}/appels/a-traiter`),
      ]);
      return { justificatifs: j.length, appels: a.length };
    }
    case "secretariat":
      return { demandes: (await apiFetch<unknown[]>(`/etablissements/${E}/liaisons`)).length };
    case "comptable": {
      const [d, i] = await Promise.all([
        apiFetch<unknown[]>(`/etablissements/${E}/declarations-paiement`),
        apiFetch<unknown[]>(`/etablissements/${E}/impayes`),
      ]);
      return { declarations: d.length, impayes: i.length };
    }
    default:
      return {};
  }
}

/** Chemins du backend que le relais /api/fichiers accepte de télécharger pour l'établissement de la session. */
export function cheminFichierAutorise(chemin: string[], etablissementId: string): boolean {
  const [racine, etab, type, , suffixe, ...reste] = chemin;
  if (racine !== "etablissements" || etab !== etablissementId) return false;
  if (reste.length === 0) {
    return (type === "justificatifs" && suffixe === "piece") || (type === "declarations-paiement" && suffixe === "preuve");
  }
  // Reçu : etablissements/{e}/eleves/{eleve}/paiements/{paiement}/recu
  return type === "eleves" && suffixe === "paiements" && reste.length === 2 && reste[1] === "recu";
}
