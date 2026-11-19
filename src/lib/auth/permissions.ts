// Contrôle d'accès basé sur les rôles (RBAC), d'après les cas d'utilisation et les règles des maquettes.
// Sert à afficher/masquer les actions ; l'API vérifie de nouveau chaque opération.
import type { Role } from "@/types/domain";

export type Permission =
  | "eleve.inscrire"
  | "eleve.corriger"
  | "eleve.valider_correction_identite"
  | "liaison.traiter"
  | "personnel.gerer"
  | "parametrage.gerer"
  | "bulletin.publier"
  | "annonce.publier"
  | "presence.saisir"
  | "justificatif.traiter"
  | "paiement.enregistrer"
  | "paiement.valider_annulation"
  | "tarif.gerer"
  | "utilisateur.gerer"
  | "plateforme.gerer";

const MATRICE: Record<Role, Permission[]> = {
  super_admin: ["plateforme.gerer"],
  direction: [
    "eleve.valider_correction_identite",
    "personnel.gerer",
    "parametrage.gerer",
    "bulletin.publier",
    "annonce.publier",
    "paiement.valider_annulation",
    "tarif.gerer",
    "utilisateur.gerer",
  ],
  secretariat: ["eleve.inscrire", "eleve.corriger", "liaison.traiter"],
  surveillant: ["annonce.publier", "presence.saisir", "justificatif.traiter"],
  comptable: ["paiement.enregistrer"],
};

export function peut(role: Role, permission: Permission): boolean {
  return MATRICE[role].includes(permission);
}
