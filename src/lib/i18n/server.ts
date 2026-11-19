// Traduction côté serveur. Chaque texte est écrit dans les deux langues, au plus près de l'écran :
//   const t = await getT();  t("Élèves", "Students")
import "server-only";
import { lang } from "next/root-params";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, hasLocale, type Locale } from "./config";

export type T = (fr: string, en: string) => string;

export const traducteur = (l: Locale): T => (fr, en) => (l === "en" ? en : fr);

/** Langue de la route courante (Server Components). */
export async function getLang(): Promise<Locale> {
  const l = await lang();
  return l && hasLocale(l) ? l : DEFAULT_LOCALE;
}

export async function getT(): Promise<T> {
  return traducteur(await getLang());
}

/** Langue dans une Server Action (root-params n'y est pas disponible) : cookie posé par le proxy. */
export async function getLangAction(): Promise<Locale> {
  const l = (await cookies()).get("NEXT_LOCALE")?.value;
  return l && hasLocale(l) ? l : DEFAULT_LOCALE;
}

export async function getTAction(): Promise<T> {
  return traducteur(await getLangAction());
}
