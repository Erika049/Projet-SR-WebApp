// Types de domaine (camelCase), calqués sur le dictionnaire de données SchoolConnect.
// Ils décrivent les objets renvoyés par l'API (ou par les données d'exemple).

export type Locale = "fr" | "en";

// ---------- Identité et accès ----------
export type Role = "super_admin" | "direction" | "secretariat" | "surveillant" | "comptable";
export type StatutCompte = "actif" | "invite" | "suspendu" | "verrouille";

export type Utilisateur = {
  id: string;
  civilite: "M." | "Mme";
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  role: Role;
  etablissementId: string | null;
  statut: StatutCompte;
  derniereConnexion: string | null;
  langue: Locale;
  personnelId?: string;
};

// ---------- Plateforme ----------
export type Plan = "essai" | "standard" | "premium";
export type StatutEtablissement = "actif" | "essai" | "expire" | "suspendu";
export type TypeEtablissement = "public" | "prive_laic" | "prive_confessionnel";
export type SousSysteme = "francophone" | "anglophone" | "bilingue";

export type Etablissement = {
  id: string;
  code: string;
  nom: string;
  ville: string;
  region: string;
  type: TypeEtablissement;
  sousSysteme: SousSysteme;
  adresse: string;
  telephone: string;
  email: string;
  plan: Plan;
  statut: StatutEtablissement;
  debutAbonnement: string;
  finAbonnement: string;
  effectifEleves: number;
  effectifPersonnel: number;
  parentsLies: number;
  nbClasses: number;
  directeurId: string | null;
  creeLe: string;
};

export type PrioriteTicket = "urgent" | "normal" | "faible";
export type Ticket = {
  id: string;
  numero: number;
  etablissementId: string;
  objet: string;
  type: "bug" | "question" | "demande";
  module: string;
  priorite: PrioriteTicket;
  statut: "ouvert" | "repondu" | "resolu";
  creeLe: string;
  auteur: string;
  messages: { auteur: string; support: boolean; date: string; texte: string }[];
};

export type EntreeAudit = {
  id: string;
  etablissementId: string | null;
  date: string;
  acteur: string;
  action: string;
  cible: string;
};

// ---------- Paramétrage ----------
export type Cycle = "premier" | "second";

export type AnneeScolaire = {
  libelle: string;
  debut: string;
  fin: string;
  statut: "preparation" | "en_cours" | "cloturee";
  regime: "trimestriel" | "semestriel";
};

export type Trimestre = {
  id: string;
  numero: number;
  debut: string;
  fin: string;
  statut: "en_cours" | "a_venir" | "cloture";
};

export type Sequence = {
  numero: number;
  trimestre: number;
  debut: string;
  fin: string;
  statut: "saisie_ouverte" | "a_venir" | "cloturee";
  saisieJusquau: string | null;
};

export type EvenementCalendrier = {
  id: string;
  libelle: string;
  debut: string;
  fin: string;
  type: "conge" | "examen" | "evenement";
};

export type ParametresEvaluation = {
  bareme: number;
  seuilReussite: number;
  seuilTableauHonneur: number;
  seuilAvertissement: number;
  decimales: number;
  delaiJustificationHeures: number;
};

export type Classe = {
  id: string;
  libelle: string;
  niveau: string;
  cycle: Cycle;
  capacite: number;
  titulaireId: string | null;
  sousSysteme: SousSysteme;
};

export type Matiere = {
  id: string;
  code: string;
  libelle: string;
  groupe: 1 | 2 | 3;
  coefficientPremierCycle: number;
  coefficientSecondCycle: number;
};

// ---------- Élèves ----------
export type StatutLiaison = "liee" | "en_attente" | "non_liee";

export type Correction = {
  id: string;
  eleveId: string;
  champ: string;
  ancienneValeur: string;
  nouvelleValeur: string;
  identite: boolean;
  statut: "a_traiter" | "attente_directeur" | "appliquee" | "refusee";
  date: string;
  demandeur: string;
};

export type Eleve = {
  id: string; // identifiant de l'inscription
  matricule: string;
  nom: string;
  prenom: string;
  sexe: "M" | "F";
  dateNaissance: string;
  lieuNaissance: string;
  nationalite: string;
  classeId: string;
  redoublant: boolean;
  statut: "actif" | "sorti";
  motifSortie?: string;
  typeInscription: "nouveau" | "reinscription" | "transfert";
  inscritLe: string;
  piecesManquantes: string[];
  tuteur: { nom: string; telephone: string; lien: "pere" | "mere" | "tuteur_legal" | "autre" };
  codeLiaison: string;
  liaison: StatutLiaison;
  remiseId: string | null;
};

export type DemandeLiaison = {
  id: string;
  parentNom: string;
  parentTelephone: string;
  eleveId: string;
  date: string;
  statut: "en_attente" | "acceptee" | "refusee";
};

// ---------- Personnel ----------
export type Fonction =
  | "directeur"
  | "enseignant"
  | "surveillant_general"
  | "surveillant"
  | "secretaire"
  | "comptable";
export type CategoriePersonnel = "enseignant" | "administration" | "surveillance";

export type Affectation = { classeId: string; matiere: string; heures: number };

export type Personnel = {
  id: string;
  matricule: string;
  civilite: "M." | "Mme";
  prenom: string;
  nom: string;
  sexe: "M" | "F";
  dateNaissance: string;
  telephone: string;
  email: string;
  fonction: Fonction;
  categorie: CategoriePersonnel;
  specialite: string;
  contrat: "permanent" | "vacataire" | "contractuel" | "fonctionnaire";
  datePriseService: string;
  heuresSemaine: number;
  statut: "actif" | "conge" | "suspendu";
  congeJusquau: string | null;
  affectations: Affectation[];
  compte: {
    acces: "mobile" | "web" | "aucun";
    invitation: "acceptee" | "envoyee" | "aucune";
    derniereConnexion: string | null;
  };
  assiduiteMois: {
    heuresPrevues: number;
    heuresEffectuees: number;
    retards: number;
    absences: number;
    absencesNonJustifiees: number;
  };
};

// ---------- Vie scolaire ----------
export type StatutPresence = "present" | "absent" | "retard";
export type Appel = {
  id: string;
  classeId: string;
  date: string;
  realisePar: string;
  statuts: Record<string, StatutPresence>;
};

export type Justificatif = {
  id: string;
  eleveId: string;
  dateAbsence: string;
  heures: string;
  motif: string;
  piece: string | null;
  statut: "en_attente" | "accepte" | "refuse";
  soumisLe: string;
  traitePar: string | null;
};

export type RetardSortie = {
  id: string;
  eleveId: string;
  date: string;
  heure: string;
  type: "retard" | "sortie";
  motif: string;
};

export type PresencePersonnel = "P" | "A" | "R";

// ---------- Notes et bulletins ----------
export type StatutBulletin = "incomplet" | "a_valider" | "valide" | "publie";
export type BulletinClasse = {
  classeId: string;
  sequence: number;
  progression: number;
  statut: StatutBulletin;
};

export type LigneBulletin = {
  eleveId: string;
  nom: string;
  moyennes: { matiere: string; coefficient: number; moyenne: number }[];
  moyenneGenerale: number;
  rang: number;
  appreciation: string;
};

// ---------- Finances ----------
export type ModePaiement = "especes" | "mtn_momo" | "orange_money" | "virement";

export type Tarif = {
  niveau: string;
  montant: number;
  versements: { libelle: string; montant: number; dateLimite: string }[];
};

export type Remise = { id: string; libelle: string; taux: number };

export type Paiement = {
  id: string;
  numeroRecu: string;
  eleveId: string;
  montant: number;
  mode: ModePaiement;
  reference: string;
  date: string;
  encaissePar: string;
  canal: "guichet" | "declaration";
  statut: "valide" | "annulation_demandee" | "annule";
  motifAnnulation: string | null;
};

export type Declaration = {
  id: string;
  parentNom: string;
  eleveId: string;
  montant: number;
  mode: ModePaiement;
  reference: string;
  date: string;
  statut: "en_attente" | "validee" | "rejetee";
};

export type Relance = { id: string; eleveId: string; date: string; canal: "sms" | "push" };

export type SituationFinanciere = {
  eleve: Eleve;
  classe: Classe | undefined;
  fraisAnnuels: number;
  remise: number;
  totalDu: number;
  paye: number;
  solde: number;
  montantEchu: number;
  retardJours: number;
  prochaineEcheance: { libelle: string; montant: number; dateLimite: string } | null;
  paiements: Paiement[];
  declarations: Declaration[];
  derniereRelance: string | null;
};

// ---------- Communication ----------
export type CanalNotification = "sms" | "email" | "push";
export type CibleAnnonce = "tous_parents" | "classe" | "enseignants" | "parents_enseignants";

export type Annonce = {
  id: string;
  titre: string;
  message: string;
  type: "annonce" | "convocation";
  cible: CibleAnnonce;
  classeIds: string[];
  canaux: CanalNotification[];
  auteurRole: "direction" | "surveillant";
  statut: "brouillon" | "programmee" | "publiee";
  date: string;
};

export type Notification = {
  id: string;
  role: Role;
  type: string;
  titre: string;
  message: string;
  date: string;
  lue: boolean;
  archivee: boolean;
  lien?: string;
};

export type PreferencesNotification = Record<string, boolean>;

// ---------- Commun ----------
export type Page<T> = { items: T[]; total: number; page: number; taille: number };
