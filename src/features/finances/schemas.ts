import { z } from "zod";

export const schemaPaiement = z
  .object({
    eleveId: z.string().min(1, "Choisissez un élève / Choose a student"),
    montant: z.coerce.number().int("Montant entier / Whole amount").positive("Montant positif / Positive amount"),
    mode: z.enum(["especes", "mtn_momo", "orange_money", "virement"]),
    reference: z.string().trim().default(""),
  })
  .refine((v) => v.mode === "especes" || v.reference.length >= 4, {
    path: ["reference"],
    message: "Référence obligatoire pour ce mode / Reference required for this method",
  });

export const schemaTarif = z.object({
  niveau: z.string().trim().min(1, "Niveau obligatoire / Level required"),
  montant: z.coerce.number().int().positive(),
  versements: z
    .array(z.object({ libelle: z.string().min(1), montant: z.coerce.number().int().positive(), dateLimite: z.string().regex(/^\d{4}-\d\d-\d\d$/) }))
    .min(1, "Au moins un versement / At least one instalment"),
});

export const schemaRemise = z.object({
  id: z.string().optional(),
  libelle: z.string().trim().min(3, "Libellé obligatoire / Name required"),
  taux: z.coerce.number().min(1).max(100),
});
