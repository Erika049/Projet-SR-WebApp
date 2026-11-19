import { z } from "zod";

const telephone = z
  .string()
  .trim()
  .regex(/^\+?[\d\s]{8,16}$/, "Numéro de téléphone invalide / Invalid phone number");

export const schemaInscription = z.object({
  nom: z.string().trim().min(2, "Nom obligatoire / Last name required"),
  prenom: z.string().trim().min(2, "Prénom obligatoire / First name required"),
  sexe: z.enum(["M", "F"], { message: "Sexe obligatoire / Sex required" }),
  dateNaissance: z.string().regex(/^\d{4}-\d\d-\d\d$/, "Date invalide / Invalid date"),
  lieuNaissance: z.string().trim().default(""),
  classeId: z.string().min(1, "Classe obligatoire / Class required"),
  tuteurNom: z.string().trim().min(3, "Nom du tuteur obligatoire / Guardian name required"),
  tuteurTelephone: telephone,
  tuteurLien: z.enum(["pere", "mere", "tuteur_legal", "autre"]).default("autre"),
});

export const schemaCorrection = z.object({
  champ: z.enum(["nom", "prenom", "dateNaissance", "lieuNaissance", "sexe", "tuteurNom", "tuteurTelephone"]),
  valeur: z.string().trim().min(1, "Nouvelle valeur obligatoire / New value required"),
});
