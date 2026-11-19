import type { Locale } from "@/types/domain";

/** Erreur renvoyée par le backend SchoolConnect (message déjà rédigé pour l'utilisateur). */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function messageErreur(e: unknown, lang: Locale = "fr"): string {
  if (e instanceof ApiError) return e.message;
  return lang === "en" ? "An unexpected error occurred." : "Une erreur inattendue est survenue.";
}
