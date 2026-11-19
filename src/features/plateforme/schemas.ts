import { z } from "zod";

export const schemaEtapeEtablissement = z.object({
  nom: z.string().trim().min(3, "Nom obligatoire / Name required"),
  type: z.enum(["public", "prive_laic", "prive_confessionnel"]),
  sousSysteme: z.enum(["francophone", "anglophone", "bilingue"]),
  region: z.string().trim().min(2, "Région obligatoire / Region required"),
  ville: z.string().trim().min(2, "Ville obligatoire / City required"),
  adresse: z.string().trim().default(""),
  telephone: z.string().trim().regex(/^\+?[\d\s]{8,16}$/, "Téléphone invalide / Invalid phone"),
  email: z.string().trim().email("Courriel invalide / Invalid email"),
});

export const schemaEtapeDirecteur = z.object({
  directeurCivilite: z.enum(["M.", "Mme"]),
  directeurPrenom: z.string().trim().min(2, "Prénom obligatoire / First name required"),
  directeurNom: z.string().trim().min(2, "Nom obligatoire / Last name required"),
  directeurEmail: z.string().trim().email("Courriel invalide / Invalid email"),
  directeurTelephone: z.string().trim().regex(/^\+?[\d\s]{8,16}$/, "Téléphone invalide / Invalid phone"),
});

export const schemaEtapeAbonnement = z.object({
  plan: z.enum(["essai", "standard", "premium"]),
  debut: z.string().regex(/^\d{4}-\d\d-\d\d$/, "Date invalide / Invalid date"),
  dureeMois: z.coerce.number().int().min(1).max(36),
});

export const schemaEtablissementComplet = schemaEtapeEtablissement.merge(schemaEtapeDirecteur).merge(schemaEtapeAbonnement);
