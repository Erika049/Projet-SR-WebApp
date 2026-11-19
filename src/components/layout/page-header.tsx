// En-tête de page des espaces : « SCHOOLCONNECT · DIRECTION / Tableau de bord » + utilisateur.
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/dal";
import { ESPACE_PAR_ROLE, LIBELLE_ESPACE, LIBELLE_ROLE } from "@/lib/auth/roles";
import { getLang, getT } from "@/lib/i18n/server";
import { Avatar } from "@/components/ui/avatar";

export async function PageHeader({
  titre,
  sousTitre,
  actions,
  filAriane,
}: {
  titre: string;
  sousTitre?: React.ReactNode;
  actions?: React.ReactNode;
  filAriane?: { href: string; libelle: string }[];
}) {
  const [session, t, lang] = await Promise.all([getCurrentUser(), getT(), getLang()]);
  const espace = ESPACE_PAR_ROLE[session.role];
  return (
    <>
      <header className="border-b border-line bg-white px-4 py-4 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
              SchoolConnect · {t(...LIBELLE_ESPACE[espace])}
            </p>
            <h1 className="truncate text-2xl font-bold text-navy-800 sm:text-[28px]">{titre}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href={`/${lang}/compte`} className="flex items-center gap-3 rounded-xl px-2 py-1 hover:bg-slate-50">
              <Avatar nom={session.nomAffiche} taille="md" className="bg-navy-700 text-white" />
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-bold text-ink">{session.nomAffiche}</span>
                <span className="block text-xs text-muted">
                  {t(...LIBELLE_ROLE[session.role])}
                  {session.etablissementNom ? ` · ${session.etablissementNom}` : ""}
                </span>
              </span>
            </Link>
          </div>
        </div>
      </header>
      {(sousTitre || actions || filAriane) && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-6 sm:px-8">
          <div className="text-sm text-muted">
            {filAriane && (
              <nav className="mb-1 flex flex-wrap items-center gap-1">
                {filAriane.map((f) => (
                  <span key={f.href} className="flex items-center gap-1">
                    <Link href={f.href} className="font-medium text-navy-700 hover:underline">
                      {f.libelle}
                    </Link>
                    <ChevronRight className="size-3.5" />
                  </span>
                ))}
                <span>{titre}</span>
              </nav>
            )}
            {sousTitre}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
    </>
  );
}

/** Zone de contenu sous l'en-tête. */
export function PageBody({ children }: { children: React.ReactNode }) {
  return <div className="space-y-6 px-4 py-6 sm:px-8">{children}</div>;
}
