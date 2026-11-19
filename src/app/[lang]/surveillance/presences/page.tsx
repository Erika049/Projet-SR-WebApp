// Route : /[lang]/surveillance/presences — Présences par classe et par jour (CU-SUR-01).
import Link from "next/link";
import { getLang, getT } from "@/lib/i18n/server";
import { dateLongue, pourcent } from "@/lib/format";
import { presencesDuJour } from "@/features/presences/queries";
import { listerJustificatifs } from "@/features/justificatifs/queries";
import { traiterJustificatif } from "@/features/justificatifs/actions";
import { relancerAppel } from "@/features/presences/actions";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GrilleStats, StatCard } from "@/components/ui/stat-card";
import { ActionButton } from "@/components/ui/action-button";

export default async function PresencesPage() {
  const [t, lang, p, justificatifs] = await Promise.all([getT(), getLang(), presencesDuJour(), listerJustificatifs("en_attente")]);
  const base = `/${lang}/surveillance`;
  return (
    <>
      <PageHeader titre={t("Présences", "Attendance")} sousTitre={dateLongue(p.date, lang)} />
      <PageBody>
        <GrilleStats>
          <StatCard libelle={t("Taux du jour", "Today's rate")} valeur={pourcent(p.taux, lang, 1)} detail={t("Toutes classes", "All classes")} ton="succes" />
          <StatCard libelle={t("Absences", "Absences")} valeur={p.absences} detail={t("Aujourd'hui", "Today")} ton="danger" />
          <StatCard libelle={t("Retards", "Late")} valeur={p.retards} detail={t("Aujourd'hui", "Today")} ton="alerte" />
          <StatCard libelle={t("À justifier", "To justify")} valeur={p.aJustifier} detail={t("Justificatifs reçus", "Notes received")} />
        </GrilleStats>
        <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
          <Card>
            <CardHeader titre={t("Taux de présence par classe", "Attendance rate per class")} sousTitre={t("Cliquez sur une classe pour saisir ou corriger l'appel.", "Click a class to take or correct the roll call.")} />
            <ul className="space-y-2">
              {p.parClasse.map((c) => (
                <li key={c.classe.id} className="flex items-center gap-3">
                  <Link href={`${base}/presences/${c.classe.id}`} className="w-16 shrink-0 text-sm font-semibold text-navy-700 hover:underline">{c.classe.libelle}</Link>
                  {c.appelFait ? (
                    <>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${c.taux! >= 95 ? "bg-brand-600" : c.taux! >= 90 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${c.taux}%` }} />
                      </div>
                      <span className="w-14 text-right text-sm font-semibold">{pourcent(c.taux!, lang, 0)}</span>
                    </>
                  ) : (
                    <div className="flex flex-1 items-center justify-between gap-2">
                      <Badge ton="danger">{t("Appel non fait", "No roll call")}</Badge>
                      <div className="flex gap-1.5">
                        <ActionButton action={relancerAppel.bind(null, c.classe.id)}>{t("Relancer", "Remind")}</ActionButton>
                        <Link href={`${base}/presences/${c.classe.id}`} className="rounded-lg bg-navy-700 px-3 py-1.5 text-xs font-semibold text-white">{t("Faire l'appel", "Take roll call")}</Link>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="h-fit">
            <CardHeader titre={t("Justificatifs à valider", "Notes to approve")} action={<Link href={`${base}/justificatifs`} className="text-sm font-semibold text-navy-700 hover:underline">{t(`Voir les ${justificatifs.length}`, `See all ${justificatifs.length}`)}</Link>} />
            <ul className="divide-y divide-line">
              {justificatifs.slice(0, 4).map((j) => (
                <li key={j.id} className="flex items-center justify-between gap-2 py-3 text-sm">
                  <div>
                    <p className="font-semibold">{j.eleve.prenom} {j.eleve.nom}</p>
                    <p className="text-muted">{j.eleve.classe.libelle} · {j.motif}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <ActionButton action={traiterJustificatif.bind(null, j.id, "refuse")} variante="danger">{t("Rejeter", "Reject")}</ActionButton>
                    <ActionButton action={traiterJustificatif.bind(null, j.id, "accepte")} variante="succes">{t("Valider", "Approve")}</ActionButton>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </PageBody>
    </>
  );
}
