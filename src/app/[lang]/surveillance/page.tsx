// Route : /[lang]/surveillance — Tableau de bord du surveillant général (CU-SUR-01).
import Link from "next/link";
import { ClipboardCheck, FileCheck2, Megaphone, TimerReset } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/dal";
import { getLang, getT } from "@/lib/i18n/server";
import { dateCourte, jourSemaine, pourcent } from "@/lib/format";
import { listerJustificatifs, presencesDuJour } from "@/lib/api/backend";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { GrilleStats, StatCard } from "@/components/ui/stat-card";
import { Compteur } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LineChart } from "@/components/charts/line-chart";

export default async function TableauSurveillancePage() {
  const [t, lang, session, p, justificatifs] = await Promise.all([getT(), getLang(), getCurrentUser(), presencesDuJour(true), listerJustificatifs("en_attente")]);
  const base = `/${lang}/surveillance`;
  const actions = [
    [t("Vérifier les fiches d'appel", "Check roll calls"), `${base}/presences`, ClipboardCheck],
    [t("Valider un justificatif", "Approve an absence note"), `${base}/justificatifs`, FileCheck2],
    [t("Saisir un retard", "Record lateness"), `${base}/retards-sorties`, TimerReset],
    [t("Nouvelle annonce", "New announcement"), `${base}/annonces`, Megaphone],
  ] as const;
  const taches: [string, number, string][] = [
    ...p.aVerifier.map((f): [string, number, string] => [
      t(`Vérifier la fiche d'appel de la ${f.classe} (${f.realisePar ?? "enseignant"})`, `Check the ${f.classe} roll call (${f.realisePar ?? "teacher"})`),
      f.aNotifier,
      `${base}/presences/${f.classeId}?date=${f.date}`,
    ]),
    ...(justificatifs.length ? [[t(`Traiter ${justificatifs.length} justificatif(s) en attente`, `Process ${justificatifs.length} pending note(s)`), justificatifs.length, `${base}/justificatifs`] as [string, number, string]] : []),
    ...p.appelsManquants.map((c): [string, number, string] => [t(`Appel non fait en ${c.libelle}`, `No roll call yet in ${c.libelle}`), 0, `${base}/presences/${c.id}`]),
  ];

  return (
    <>
      <PageHeader titre={t("Tableau de bord", "Dashboard")} sousTitre={`${t("Bonjour", "Hello")} ${session.nomAffiche}${session.etablissementNom ? ` · ${session.etablissementNom}` : ""} · ${dateCourte(p.date, lang)}`} />
      <PageBody>
        <GrilleStats>
          <StatCard libelle={t("Taux du jour", "Today's rate")} valeur={pourcent(p.taux, lang, 1)} detail={t("Classes ayant fait l'appel", "Classes with a roll call")} ton="succes" />
          <StatCard libelle={t("Absences", "Absences")} valeur={p.absences} detail={t("Aujourd'hui", "Today")} ton="danger" />
          <StatCard libelle={t("Retards", "Late")} valeur={p.retards} detail={t("Aujourd'hui", "Today")} ton="alerte" />
          <StatCard libelle={t("Fiches à vérifier", "Roll calls to check")} valeur={p.aVerifier.length} detail={t("Soumises par les enseignants", "Submitted by teachers")} />
        </GrilleStats>
        <Card>
          <CardHeader titre={t("Actions rapides", "Quick actions")} />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {actions.map(([libelle, href, Icone]) => (
              <Link key={libelle} href={href} className="flex items-center gap-3 rounded-xl border border-line p-4 font-semibold text-navy-800 transition hover:border-navy-200 hover:bg-navy-50">
                <span className="grid size-10 place-items-center rounded-lg bg-navy-50 text-navy-700"><Icone className="size-5" /></span>
                {libelle}
              </Link>
            ))}
          </div>
        </Card>
        <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
          <Card>
            <CardHeader titre={t("Présence sur 7 jours", "Attendance over 7 days")} />
            {p.semaine.length === 0 ? (
              <EmptyState titre={t("Aucun appel sur les 7 derniers jours", "No roll call over the last 7 days")} />
            ) : (
              <LineChart donnees={p.semaine.map((j) => ({ libelle: jourSemaine(j.date, lang), valeur: j.taux }))} min={Math.max(0, Math.floor(Math.min(88, ...p.semaine.map((j) => j.taux)) / 5) * 5)} max={100} />
            )}
          </Card>
          <Card>
            <CardHeader titre={t("Tâches du jour", "Today's tasks")} />
            {taches.length === 0 ? (
              <EmptyState titre={t("Rien en attente", "Nothing pending")} />
            ) : (
              <ul className="divide-y divide-line">
                {taches.map(([libelle, n, href]) => (
                  <li key={href + libelle}>
                    <Link href={href} className="flex items-center justify-between py-3 text-sm hover:text-navy-700">
                      {libelle}
                      {n > 0 && <Compteur valeur={n} />}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </PageBody>
    </>
  );
}
