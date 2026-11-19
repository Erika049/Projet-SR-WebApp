import { z } from "zod";

const date = z.string().regex(/^\d{4}-\d\d-\d\d$/, "Date invalide / Invalid date");

export const schemaAnnee = z
  .object({ libelle: z.string().trim().regex(/^\d{4}-\d{4}$/, "Format AAAA-AAAA / Format YYYY-YYYY"), debut: date, fin: date, regime: z.enum(["trimestriel", "semestriel"]) })
  .refine((v) => v.debut < v.fin, { path: ["fin"], message: "La fin doit suivre le début / End must follow start" });

export const schemaPeriode = z
  .object({ debut: date, fin: date, statut: z.string() })
  .refine((v) => v.debut < v.fin, { path: ["fin"], message: "La fin doit suivre le début / End must follow start" });

export const schemaClasse = z.object({
  libelle: z.string().trim().min(2, "Nom obligatoire / Name required"),
  niveau: z.string().min(1),
  cycle: z.enum(["premier", "second"]),
  capacite: z.coerce.number().int().min(1).max(150),
  titulaireId: z.string().transform((v) => v || null),
  sousSysteme: z.enum(["francophone", "anglophone", "bilingue"]).default("francophone"),
});

export const schemaMatiere = z.object({
  id: z.string().optional(),
  code: z.string().trim().min(2).max(8).transform((v) => v.toUpperCase()),
  libelle: z.string().trim().min(2, "Libellé obligatoire / Name required"),
  groupe: z.coerce.number().int().min(1).max(3),
  coefficientPremierCycle: z.coerce.number().min(0).max(10),
  coefficientSecondCycle: z.coerce.number().min(0).max(10),
});

export const schemaEvenement = z
  .object({ libelle: z.string().trim().min(3, "Libellé obligatoire / Name required"), debut: date, fin: date, type: z.enum(["conge", "examen", "evenement"]) })
  .refine((v) => v.debut <= v.fin, { path: ["fin"], message: "La fin doit suivre le début / End must follow start" });

export const schemaEvaluation = z.object({
  bareme: z.coerce.number().int().min(10).max(100),
  seuilReussite: z.coerce.number().min(0),
  seuilTableauHonneur: z.coerce.number().min(0),
  seuilAvertissement: z.coerce.number().min(0),
  decimales: z.coerce.number().int().min(0).max(3),
  delaiJustificationHeures: z.coerce.number().int().min(1).max(240),
});
