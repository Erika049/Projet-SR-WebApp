"use client";

import { createContext, use } from "react";
import type { Locale } from "./config";

const LangContext = createContext<Locale>("fr");

export function I18nProvider({ lang, children }: { lang: Locale; children: React.ReactNode }) {
  return <LangContext value={lang}>{children}</LangContext>;
}

export function useLang(): Locale {
  return use(LangContext);
}

/** Traduction dans les Client Components : const t = useT(); t("Enregistrer", "Save") */
export function useT() {
  const lang = useLang();
  return (fr: string, en: string) => (lang === "en" ? en : fr);
}
