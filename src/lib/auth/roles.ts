import type { Role } from "@/types/domain";

// Rôles disponibles sur le web. Enseignants, parents et élèves utilisent l'application mobile.
export const ROLES_WEB: Role[] = ["super_admin", "direction", "secretariat", "surveillant", "comptable"];

export type Espace = "plateforme" | "direction" | "secretariat" | "surveillance" | "comptabilite";

export const ESPACE_PAR_ROLE: Record<Role, Espace> = {
  super_admin: "plateforme",
  direction: "direction",
  secretariat: "secretariat",
  surveillant: "surveillance",
  comptable: "comptabilite",
};

export const LIBELLE_ROLE: Record<Role, [fr: string, en: string]> = {
  super_admin: ["Super-administrateur", "Super administrator"],
  direction: ["Directeur", "Principal"],
  secretariat: ["Secrétaire de direction", "Administrative secretary"],
  surveillant: ["Surveillant général", "Head of discipline"],
  comptable: ["Comptable", "Bursar"],
};

export const LIBELLE_ESPACE: Record<Espace, [fr: string, en: string]> = {
  plateforme: ["Plateforme", "Platform"],
  direction: ["Direction", "Management"],
  secretariat: ["Secrétariat", "Secretariat"],
  surveillance: ["Surveillance générale", "Discipline office"],
  comptabilite: ["Comptabilité", "Accounting"],
};

export function accueilDuRole(role: Role, lang: string) {
  return `/${lang}/${ESPACE_PAR_ROLE[role]}`;
}
