import { z } from "zod";

const liste = z.union([z.string(), z.array(z.string())]).optional().transform((v) => (Array.isArray(v) ? v : v ? [v] : []));

export const schemaAnnonce = z
  .object({
    titre: z.string().trim().min(3, "Titre obligatoire / Title required").max(120),
    message: z.string().trim().min(10, "Message trop court / Message too short").max(1000),
    type: z.enum(["annonce", "convocation"]).default("annonce"),
    cible: z.enum(["tous_parents", "classe", "enseignants", "parents_enseignants"]),
    classeIds: liste,
    canaux: liste.pipe(z.array(z.enum(["sms", "email", "push"])).min(1, "Choisissez au moins un canal / Choose at least one channel")),
    mode: z.enum(["publier", "programmer", "brouillon"]),
    date: z.string().optional(),
  })
  .refine((v) => v.cible !== "classe" || v.classeIds.length > 0, { path: ["classeIds"], message: "Choisissez au moins une classe / Choose at least one class" })
  .refine((v) => v.mode !== "programmer" || !!v.date, { path: ["date"], message: "Date de programmation obligatoire / Schedule date required" });
