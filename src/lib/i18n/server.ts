// Textes côté serveur. L'application est uniquement en français : t("Élèves", "Students") renvoie toujours
// le texte français (la version anglaise reste dans le code, sans être proposée à l'utilisateur).
import "server-only";
import { DEFAULT_LOCALE, type Locale } from "./config";

export type T = (fr: string, en: string) => string;

export const traducteur = (l: Locale): T => (fr, en) => (l === "en" ? en : fr);

/** Langue de l'application : français. */
export async function getLang(): Promise<Locale> {
  return DEFAULT_LOCALE;
}

export async function getT(): Promise<T> {
  return traducteur(DEFAULT_LOCALE);
}

/** Langue dans une Server Action : français. */
export async function getLangAction(): Promise<Locale> {
  return DEFAULT_LOCALE;
}

export async function getTAction(): Promise<T> {
  return traducteur(DEFAULT_LOCALE);
}
