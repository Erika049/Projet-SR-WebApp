"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { useLang } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

/** Bascule FR | EN : remplace le segment de langue de l'URL (le proxy mémorise ensuite le choix dans NEXT_LOCALE). */
export function LocaleSwitcher({ grand = false }: { grand?: boolean }) {
  const lang = useLang();
  const chemin = usePathname();
  const params = useSearchParams();
  const router = useRouter();

  const changer = (l: Locale) => {
    if (l === lang) return;
    const reste = chemin.replace(/^\/(fr|en)(?=\/|$)/, "");
    const q = params.toString();
    router.replace(`/${l}${reste}${q ? `?${q}` : ""}`, { scroll: false });
  };

  const libelles: Record<Locale, string> = grand ? { fr: "Français · FR", en: "English · EN" } : { fr: "FR", en: "EN" };
  return (
    <div className={cn("flex rounded-xl border border-line bg-slate-100 p-1", grand && "w-full")}>
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => changer(l)}
          aria-pressed={l === lang}
          className={cn(
            "rounded-lg text-xs font-bold transition",
            grand ? "flex-1 py-2" : "px-3 py-1.5",
            l === lang ? "bg-white text-navy-800 shadow-sm" : "text-muted hover:text-navy-700",
          )}
        >
          {libelles[l]}
        </button>
      ))}
    </div>
  );
}
