import Link from "next/link";
import { cn, avecParams } from "@/lib/utils";

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="-mx-5 overflow-x-auto px-5">
      <table className={cn("w-full min-w-[640px] border-collapse text-sm", className)}>{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={cn("border-b border-line px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted", className)}>
      {children}
    </th>
  );
}

export function Td({ children, className, colSpan }: { children?: React.ReactNode; className?: string; colSpan?: number }) {
  return (
    <td colSpan={colSpan} className={cn("border-b border-line/70 px-3 py-3 align-middle", className)}>
      {children}
    </td>
  );
}

export function LigneVide({ colSpan, texte }: { colSpan: number; texte: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-3 py-10 text-center text-sm text-muted">
        {texte}
      </td>
    </tr>
  );
}

/** « Affichage 1-8 sur 1 248 · Précédent 1 2 3 Suivant » (liens, aucun JavaScript requis). */
export function Pagination({
  page,
  total,
  taille,
  base,
  params = {},
  t,
}: {
  page: number;
  total: number;
  taille: number;
  base: string;
  params?: Record<string, string | undefined>;
  t: (fr: string, en: string) => string;
}) {
  const pages = Math.max(1, Math.ceil(total / taille));
  const debut = total === 0 ? 0 : (page - 1) * taille + 1;
  const fin = Math.min(total, page * taille);
  const lien = (p: number) => avecParams(base, { ...params, page: p > 1 ? p : undefined });
  const fenetre = Array.from({ length: pages }, (_, i) => i + 1).filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === pages);
  const cls = "rounded-md px-2.5 py-1 text-xs font-semibold";
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
      <span>
        {t("Affichage", "Showing")} {debut}–{fin} {t("sur", "of")} {total}
      </span>
      {pages > 1 && (
        <nav className="flex items-center gap-1">
          {page > 1 ? <Link href={lien(page - 1)} className={cn(cls, "text-navy-700 hover:bg-navy-50")}>{t("Précédent", "Previous")}</Link> : <span className={cn(cls, "opacity-40")}>{t("Précédent", "Previous")}</span>}
          {fenetre.map((p, i) => (
            <span key={p} className="flex items-center">
              {i > 0 && fenetre[i - 1] !== p - 1 && <span className="px-1">…</span>}
              <Link href={lien(p)} className={cn(cls, p === page ? "bg-navy-700 text-white" : "text-navy-700 hover:bg-navy-50")}>
                {p}
              </Link>
            </span>
          ))}
          {page < pages ? <Link href={lien(page + 1)} className={cn(cls, "text-navy-700 hover:bg-navy-50")}>{t("Suivant", "Next")}</Link> : <span className={cn(cls, "opacity-40")}>{t("Suivant", "Next")}</span>}
        </nav>
      )}
    </div>
  );
}
