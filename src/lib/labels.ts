// Libellés bilingues des valeurs d'énumération (statuts, modes de paiement…), avec leur ton de badge.
import type { Ton } from "@/components/ui/badge";

type Libelle = [fr: string, en: string, ton?: Ton];

export const MODE_PAIEMENT: Record<string, Libelle> = {
  especes: ["Espèces", "Cash"],
  mtn_momo: ["MTN MoMo", "MTN MoMo"],
  orange_money: ["Orange Money", "Orange Money"],
  virement: ["Virement", "Bank transfer"],
};

export const PLAN: Record<string, Libelle> = {
  essai: ["Essai", "Trial", "info"],
  standard: ["Standard", "Standard", "neutre"],
  premium: ["Premium", "Premium", "navy"],
};

export const STATUT_ETABLISSEMENT: Record<string, Libelle> = {
  actif: ["Actif", "Active", "succes"],
  essai: ["En essai", "Trial", "info"],
  expire: ["Expiré", "Expired", "danger"],
  suspendu: ["Suspendu", "Suspended", "danger"],
};

export const STATUT_COMPTE: Record<string, Libelle> = {
  actif: ["Actif", "Active", "succes"],
  invite: ["Invité", "Invited", "info"],
  suspendu: ["Suspendu", "Suspended", "danger"],
  verrouille: ["Verrouillé", "Locked", "alerte"],
  conge: ["En congé", "On leave", "alerte"],
};

export const PRIORITE: Record<string, Libelle> = {
  urgent: ["Urgent", "Urgent", "danger"],
  normal: ["Normal", "Normal", "neutre"],
  faible: ["Faible", "Low", "info"],
};

export const STATUT_TICKET: Record<string, Libelle> = {
  ouvert: ["Ouvert", "Open", "alerte"],
  repondu: ["Répondu", "Answered", "info"],
  resolu: ["Résolu", "Resolved", "succes"],
};

export const LIAISON: Record<string, Libelle> = {
  liee: ["Liée", "Linked", "succes"],
  en_attente: ["En attente", "Pending", "alerte"],
  non_liee: ["Non liée", "Not linked", "neutre"],
};

export const STATUT_BULLETIN: Record<string, Libelle> = {
  incomplet: ["Notes incomplètes", "Incomplete marks", "alerte"],
  a_valider: ["À valider", "To approve", "info"],
  valide: ["Validé", "Approved", "navy"],
  publie: ["Publié", "Published", "succes"],
};

export const STATUT_PERIODE: Record<string, Libelle> = {
  en_cours: ["En cours", "In progress", "succes"],
  a_venir: ["À venir", "Upcoming", "neutre"],
  cloture: ["Clôturé", "Closed", "navy"],
  saisie_ouverte: ["Saisie ouverte", "Entry open", "succes"],
  cloturee: ["Clôturée", "Closed", "navy"],
};

export const STATUT_JUSTIFICATIF: Record<string, Libelle> = {
  en_attente: ["À valider", "Pending", "alerte"],
  accepte: ["Validé", "Approved", "succes"],
  refuse: ["Refusé", "Rejected", "danger"],
};

export const STATUT_CORRECTION: Record<string, Libelle> = {
  a_traiter: ["À traiter par vous", "To handle", "alerte"],
  attente_directeur: ["Validation du directeur", "Awaiting principal", "info"],
  appliquee: ["Appliquée", "Applied", "succes"],
  refusee: ["Refusée", "Rejected", "danger"],
};

export const STATUT_ANNONCE: Record<string, Libelle> = {
  brouillon: ["Brouillon", "Draft", "neutre"],
  programmee: ["Programmée", "Scheduled", "info"],
  publiee: ["Publiée", "Published", "succes"],
};

export const STATUT_PAIEMENT: Record<string, Libelle> = {
  valide: ["Validé", "Confirmed", "succes"],
  annulation_demandee: ["Annulation demandée", "Cancellation requested", "alerte"],
  annule: ["Annulé", "Cancelled", "danger"],
};

export const FONCTION: Record<string, Libelle> = {
  directeur: ["Directeur", "Principal"],
  enseignant: ["Enseignant", "Teacher"],
  surveillant_general: ["Surveillant général", "Head of discipline"],
  surveillant: ["Surveillant", "Supervisor"],
  secretaire: ["Secrétaire de direction", "Secretary"],
  comptable: ["Comptable", "Bursar"],
};

export const CONTRAT: Record<string, Libelle> = {
  permanent: ["Permanent", "Permanent"],
  vacataire: ["Vacataire", "Part-time"],
  contractuel: ["Contractuel", "Contract"],
  fonctionnaire: ["Fonctionnaire", "Civil servant"],
};

export const TYPE_ETABLISSEMENT: Record<string, Libelle> = {
  public: ["Public", "Public"],
  prive_laic: ["Privé laïc", "Private (secular)"],
  prive_confessionnel: ["Privé confessionnel", "Private (faith-based)"],
};

export const SOUS_SYSTEME: Record<string, Libelle> = {
  francophone: ["Francophone", "French-speaking"],
  anglophone: ["Anglophone", "English-speaking"],
  bilingue: ["Bilingue", "Bilingual"],
};

export const CIBLE_ANNONCE: Record<string, Libelle> = {
  tous_parents: ["Tous les parents", "All parents"],
  classe: ["Une classe", "One class"],
  enseignants: ["Enseignants", "Teachers"],
  parents_enseignants: ["Parents et enseignants", "Parents and teachers"],
};

export const LIEN_TUTEUR: Record<string, Libelle> = {
  pere: ["Père", "Father"],
  mere: ["Mère", "Mother"],
  tuteur_legal: ["Tuteur légal", "Legal guardian"],
  autre: ["Autre", "Other"],
};

/** Traduit une valeur avec la table donnée. */
export function lib(table: Record<string, Libelle>, valeur: string, t: (fr: string, en: string) => string) {
  const l = table[valeur];
  return l ? t(l[0], l[1]) : valeur;
}
export function ton(table: Record<string, Libelle>, valeur: string): Ton {
  return table[valeur]?.[2] ?? "neutre";
}
