"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BookOpen, LogOut, Menu, X } from "lucide-react";
import { NAVIGATION, type CleBadge } from "@/config/navigation";
import { LIBELLE_ESPACE, type Espace } from "@/lib/auth/roles";
import { useLang, useT } from "@/lib/i18n/client";
import { deconnexion } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

export function Logo({ lien }: { lien: string }) {
  return (
    <Link href={lien} className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-navy-700 text-white">
        <BookOpen className="size-5" />
      </span>
      <span className="text-lg font-bold text-navy-800">SchoolConnect</span>
    </Link>
  );
}

export function Sidebar({ espace, badges }: { espace: Espace; badges: Partial<Record<CleBadge, number>> }) {
  const lang = useLang();
  const t = useT();
  const chemin = usePathname();
  const [ouvert, setOuvert] = useState(false);
  const entrees = NAVIGATION[espace];
  const racine = `/${lang}/${espace}`;
  const estActif = (href: string) => {
    const complet = `/${lang}${href}`;
    return complet === racine ? chemin === racine : chemin === complet || chemin.startsWith(complet + "/");
  };

  const contenu = (
    <>
      <div className="px-5 pt-5">
        <Logo lien={racine} />
        <p className="mt-4 rounded-lg bg-brand-50 px-3 py-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-brand-700">
          {t(...LIBELLE_ESPACE[espace])}
        </p>
      </div>
      <nav className="mt-4 flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {entrees.map((e) => {
          const actif = estActif(e.href);
          const n = e.badge ? badges[e.badge] : undefined;
          const Icone = e.icone;
          return (
            <Link
              key={e.href}
              href={`/${lang}${e.href}`}
              onClick={() => setOuvert(false)}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                actif ? "bg-navy-50 font-semibold text-navy-800" : "text-slate-600 hover:bg-slate-50 hover:text-navy-700",
              )}
            >
              {actif && <span className="absolute -left-3 top-1.5 bottom-1.5 w-1 rounded-r bg-brand-600" />}
              <Icone className="size-[18px] shrink-0" />
              <span className="flex-1 leading-tight">{t(...e.libelle)}</span>
              {!!n && <span className={cn("rounded-md px-1.5 text-xs font-bold", e.badge === "notifications" || e.badge === "impayes" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700")}>{n}</span>}
            </Link>
          );
        })}
      </nav>
      <form action={deconnexion} className="border-t border-line p-4">
        <button className="flex w-full items-center gap-2 rounded-lg border border-line px-3 py-2.5 text-sm font-semibold text-navy-700 hover:bg-navy-50">
          <LogOut className="size-4" />
          {t("Se déconnecter", "Sign out")}
        </button>
      </form>
    </>
  );

  return (
    <>
      {/* Mobile : bandeau + tiroir */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:hidden">
        <Logo lien={racine} />
        <button onClick={() => setOuvert(true)} className="rounded-lg p-2 text-navy-700 hover:bg-navy-50" aria-label={t("Ouvrir le menu", "Open menu")}>
          <Menu className="size-5" />
        </button>
      </div>
      {ouvert && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-navy-900/40" onClick={() => setOuvert(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl">
            <button onClick={() => setOuvert(false)} className="absolute right-3 top-3 rounded-md p-1 text-muted" aria-label={t("Fermer", "Close")}>
              <X className="size-5" />
            </button>
            {contenu}
          </aside>
        </div>
      )}
      {/* Bureau */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-white lg:flex">{contenu}</aside>
    </>
  );
}
