// Route : /[lang]/plateforme — Vue d'ensemble de toutes les écoles (CU-SAD-04).
import Link from "next/link";
import { Building2, GraduationCap, LifeBuoy, RefreshCw } from "lucide-react";
import { getLang, getT } from "@/lib/i18n/server";
import { dateCourte, ilYa, moisCourt, nombre, aujourdhuiIso } from "@/lib/format";
import { PLAN, PRIORITE, lib, ton } from "@/lib/labels";
import { vueEnsemble } from "@/features/plateforme/queries";
import { prolongerAbonnement } from "@/features/plateforme/actions";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GrilleStats, StatCard } from "@/components/ui/stat-card";
import { ActionButton } from "@/components/ui/action-button";
import { BarChart } from "@/components/charts/bar-chart";
import { DonutChart } from "@/components/charts/donut-chart";

export default async function VueEnsemblePage() {
  const [t, lang, v] = await Promise.all([getT(), getLang(), vueEnsemble()]);
  const base = `/${lang}/plateforme`;
  const aujourdhui = aujourdhuiIso();
  return (
    <>
      <PageHeader titre={t("Vue d'ensemble", "Overview")} sousTitre={t("Toutes les écoles de la plateforme", "All schools on the platform")} />
      <PageBody>
        <GrilleStats>
          <StatCard libelle={t("Établissements actifs", "Active schools")} valeur={v.actifs} detail={t(`sur ${v.total} établissements`, `of ${v.total} schools`)} icone={<Building2 className="size-5" />} />
          <StatCard libelle={t("Élèves (toutes écoles)", "Students (all schools)")} valeur={nombre(v.eleves, lang)} detail={t(`dans ${v.total} établissements`, `in ${v.total} schools`)} icone={<GraduationCap className="size-5" />} ton="succes" />
          <StatCard libelle={t("À renouveler", "To renew")} valeur={v.aRenouveler} detail={t("dans les 30 jours", "within 30 days")} icone={<RefreshCw className="size-5" />} ton="alerte" />
          <StatCard libelle={t("Tickets ouverts", "Open tickets")} valeur={v.ticketsOuverts} detail={t(`dont ${v.ticketsUrgents} urgents`, `${v.ticketsUrgents} urgent`)} icone={<LifeBuoy className="size-5" />} ton="danger" />
        </GrilleStats>
        <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
          <Card>
            <CardHeader titre={t("Nouveaux établissements par mois", "New schools per month")} />
            <BarChart donnees={v.parMois.map((m, i, arr) => ({ libelle: moisCourt(m.cle, lang), valeur: m.n, accent: i === arr.length - 1 }))} />
          </Card>
          <Card>
            <CardHeader titre={t("Répartition des plans", "Plans breakdown")} />
            <DonutChart centre={v.total} parts={v.parPlan.map((p, i) => ({ libelle: lib(PLAN, p.plan, t), valeur: p.n, couleur: ["#3fc99a", "#173f73", "#f5b800"][i] }))} />
          </Card>
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader titre={t("Abonnements à renouveler", "Subscriptions to renew")} action={<Link href={`${base}/abonnements`} className="text-sm font-semibold text-navy-700 hover:underline">{t("Voir tout", "See all")}</Link>} />
            <ul className="divide-y divide-line">
              {v.renouvellements.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <Link href={`${base}/etablissements/${e.id}`} className="font-semibold hover:underline">{e.nom}</Link>
                    <p className="text-xs text-muted">{e.finAbonnement < aujourdhui ? <span className="text-red-600">{t("Expiré", "Expired")}</span> : `${t("Fin", "Ends")} : ${dateCourte(e.finAbonnement, lang)}`}</p>
                  </div>
                  <ActionButton action={prolongerAbonnement.bind(null, e.id)} champs={{ mois: "12" }}>{t("Prolonger", "Extend")}</ActionButton>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardHeader titre={t("Derniers tickets", "Latest tickets")} action={<Link href={`${base}/support`} className="text-sm font-semibold text-navy-700 hover:underline">{t("Voir tout", "See all")}</Link>} />
            <ul className="divide-y divide-line">
              {v.derniersTickets.map((tk) => (
                <li key={tk.id}>
                  <Link href={`${base}/support/${tk.id}`} className="flex items-center justify-between gap-3 py-3 text-sm hover:text-navy-700">
                    <div>
                      <p className="font-semibold">{tk.objet}</p>
                      <p className="text-xs text-muted">{tk.etablissement.nom} · {ilYa(tk.creeLe, lang)}</p>
                    </div>
                    <Badge ton={ton(PRIORITE, tk.priorite)}>{lib(PRIORITE, tk.priorite, t)}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </PageBody>
    </>
  );
}
