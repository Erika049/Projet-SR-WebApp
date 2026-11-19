"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export type Onglet = { href: string; libelle: string; compteur?: number };

/**
 * Onglets liés à l'URL. Un onglet est actif si son href correspond exactement à l'URL courante
 * (chemin + paramètres qu'il déclare). Le premier onglet est actif par défaut.
 */
export function Tabs({ onglets, className }: { onglets: Onglet[]; className?: string }) {
  const chemin = usePathname();
  const params = useSearchParams();
  const estActif = (href: string) => {
    const [p, q] = href.split("?");
    if (p !== chemin) return false;
    if (!q) return true;
    return [...new URLSearchParams(q)].every(([k, v]) => params.get(k) === v);
  };
  let actif = onglets.findIndex((o) => o.href.includes("?") && estActif(o.href));
  if (actif === -1) actif = onglets.findIndex((o) => estActif(o.href));
  if (actif === -1) actif = 0;

  return (
    <nav className={cn("flex gap-1 overflow-x-auto rounded-xl bg-navy-50/70 p-1", className)}>
      {onglets.map((o, i) => (
        <Link
          key={o.href}
          href={o.href}
          scroll={false}
          className={cn(
            "flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-semibold transition",
            i === actif ? "bg-white text-navy-800 shadow-sm" : "text-muted hover:text-navy-700",
          )}
        >
          {o.libelle}
          {o.compteur !== undefined && <span className="rounded-md bg-navy-100 px-1.5 text-xs text-navy-700">{o.compteur}</span>}
        </Link>
      ))}
    </nav>
  );
}
