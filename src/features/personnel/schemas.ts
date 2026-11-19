import { z } from "zod";

export const schemaMembre = z
  .object({
    civilite: z.enum(["M.", "Mme"]),
    prenom: z.string().trim().min(2, "Prénom obligatoire / First name required"),
    nom: z.string().trim().min(2, "Nom obligatoire / Last name required"),
    sexe: z.enum(["M", "F"]),
    dateNaissance: z.string().regex(/^\d{4}-\d\d-\d\d$/, "Date invalide / Invalid date"),
    telephone: z.string().trim().regex(/^\+?[\d\s]{8,16}$/, "Téléphone invalide / Invalid phone"),
    email: z.string().trim().email("Courriel invalide / Invalid email"),
    fonction: z.enum(["enseignant", "surveillant_general", "surveillant", "secretaire", "comptable", "directeur"]),
    specialite: z.string().trim().default(""),
    contrat: z.enum(["permanent", "vacataire", "contractuel", "fonctionnaire"]),
    datePriseService: z.string().regex(/^\d{4}-\d\d-\d\d$/, "Date invalide / Invalid date"),
    heuresSemaine: z.coerce.number().int().min(0).max(60),
    classeIds: z.union([z.string(), z.array(z.string())]).transform((v) => (Array.isArray(v) ? v : v ? [v] : [])),
    titulaireDe: z.string().transform((v) => v || null),
    creerCompte: z.string().optional().transform((v) => v === "on"),
  })
  .refine((v) => v.fonction !== "enseignant" || v.specialite.length > 1, { path: ["specialite"], message: "Matière obligatoire pour un enseignant / Subject required for a teacher" });
