import type { Locale } from "@/types/domain";

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

/** Erreur métier des données d'exemple (équivalent d'un 400/409 de l'API), en deux langues. */
export class ErreurMetier extends ApiError {
  constructor(
    fr: string,
    public en: string = fr,
  ) {
    super(400, fr, "METIER");
  }
}

export function messageErreur(e: unknown, lang: Locale = "fr"): string {
  if (e instanceof ErreurMetier) return lang === "en" ? e.en : e.message;
  if (e instanceof ApiError) return e.message;
  return lang === "en" ? "An unexpected error occurred." : "Une erreur inattendue est survenue.";
}
