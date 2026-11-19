// Outils communs aux Server Actions : état renvoyé aux formulaires, validation Zod, rafraîchissement.
import type { z } from "zod";

export type EtatFormulaire = {
  ok?: boolean;
  message?: string;
  erreurs?: Record<string, string>;
  /** Données utiles à l'écran après succès (ex. matricule et code de liaison générés). */
  donnees?: Record<string, string | number>;
};

export const ETAT_INITIAL: EtatFormulaire = {};

/** FormData → objet simple ; les champs multiples (cases à cocher) deviennent des tableaux. */
export function lireFormulaire(fd: FormData): Record<string, string | string[]> {
  const obj: Record<string, string | string[]> = {};
  for (const cle of new Set(fd.keys())) {
    if (cle.startsWith("$ACTION")) continue;
    const valeurs = fd.getAll(cle).filter((v): v is string => typeof v === "string");
    obj[cle] = valeurs.length > 1 ? valeurs : (valeurs[0] ?? "");
  }
  return obj;
}

export function erreursZod(erreur: z.ZodError): Record<string, string> {
  const res: Record<string, string> = {};
  for (const i of erreur.issues) {
    const cle = i.path.join(".");
    if (!res[cle]) res[cle] = i.message;
  }
  return res;
}

export function echec(message: string, erreurs?: Record<string, string>): EtatFormulaire {
  return { ok: false, message, erreurs };
}
