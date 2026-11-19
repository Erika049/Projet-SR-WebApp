// Route : /[lang]/plateforme — Vue d'ensemble des établissements de la plateforme (CU-SAD-04).
import Link from "next/link";
import { Building2 } from "lucide-react";
import { getLang, getT } from "@/lib/i18n/server";
import { listerEtablissements } from "@/lib/api/backend";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { GrilleStats, StatCard } from "@/components/ui/stat-card";

export default async function PlateformePage() {
  const [t, lang, etablissements] = await Promise.all([getT(), getLang(), listerEtablissements()]);
  const actifs = etablissements.filter((e) => e.statut === "ACTIF");
  return (
    <>
      <PageHeader
        titre={t("Vue d'ensemble", "Overview")}
        actions={
          <Link href={`/${lang}/plateforme/etablissements/nouveau`} className="inline-flex items-center gap-2 rounded-lg bg-navy-700 px-4 py-2 text-sm font-semibold text-white">
            <Building2 className="size-4" /> {t("Créer un établissement", "Create a school")}
          </Link>
        }
      />
      <PageBody>
        <GrilleStats>
          <StatCard libelle={t("Établissements", "Schools")} valeur={etablissements.length} detail={t(`${actifs.length} actifs`, `${actifs.length} active`)} />
          <StatCard libelle={t("Villes", "Cities")} valeur={new Set(etablissements.map((e) => e.ville).filter(Boolean)).size} />
        </GrilleStats>
        <Card>
          <CardHeader titre={t("Établissements", "Schools")} />
          {etablissements.length === 0 ? (
            <EmptyState titre={t("Aucun établissement", "No school")} />
          ) : (
            <ul className="divide-y divide-line text-sm">
              {etablissements.map((e) => (
                <li key={e.id} className="flex justify-between py-2">
                  <Link href={`/${lang}/plateforme/etablissements/${e.id}`} className="font-semibold text-navy-700 hover:underline">{e.nom}</Link>
                  <span className="text-muted">{e.code} · {e.ville ?? "—"}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </PageBody>
    </>
  );
}
