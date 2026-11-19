// Route : /[lang]/surveillance — Tableau de bord du surveillant général (CU-SUR-01).
import Link from "next/link";
import { ClipboardCheck, FileCheck2, Megaphone, TimerReset } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/dal";
import { getLang, getT } from "@/lib/i18n/server";
import { dateCourte, jourSemaine, pourcent } from "@/lib/format";
import { tableauSurveillance } from "@/features/tableaux-de-bord/queries";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { GrilleStats, StatCard } from "@/components/ui/stat-card";
import { Compteur } from "@/components/ui/badge";
import { LineChart } from "@/components/charts/line-chart";

export default async function TableauSurveillancePage() {
  const [t, lang, session, d] = await Promise.all([getT(), getLang(), getCurrentUser(), tableauSurveillance()]);
  const base = `/${lang}/surveillance`;
  const p = d.presence;
  const actions = [
    [t("Valider un justificatif", "Approve an absence note"), `${base}/justificatifs`, FileCheck2],
    [t("Saisir un retard", "Record lateness"), `${base}/retards-sorties`, TimerReset],
    [t("Nouvelle annonce", "New announcement"), `${base}/annonces`, Megaphone],
    [t("Appel du personnel", "Staff roll call"), `${base}/assiduite-personnel`, ClipboardCheck],
  ] as const;
  const taches: [string, number, string][] = [
    [t(`Valider les ${d.justificatifs.length} justificatifs en attente`, `Approve ${d.justificatifs.length} pending notes`), d.justificatifs.length, `${base}/justificatifs`],
    ...p.appelsManquants.map((c): [string, number, string] => [t(`Relancer l'appel de la ${c.libelle}`, `Chase the roll call for ${c.libelle}`), 0, `${base}/presences/${c.id}`]),
    ...d.repetes.map((r): [string, number, string] => [t(`Suivre les retards répétés de ${r.eleve.prenom} ${r.eleve.nom}`, `Follow up repeated lateness of ${r.eleve.prenom} ${r.eleve.nom}`), r.nombre, `${base}/retards-sorties`]),
    [t("Contrôler l'assiduité du personnel", "Check staff attendance"), 0, `${base}/assiduite-personnel`],
  ];

  return (
    <>
      <PageHeader titre={t("Tableau de bord", "Dashboard")} sousTitre={`${t("Bonjour", "Hello")} ${session.nomAffiche.split(" ").slice(0, 1).join("")} ${session.nomAffiche.split(" ").at(-1)} · Lycée bilingue de Bafoussam · ${dateCourte(p.date, lang)}`} />
      <PageBody>
        <GrilleStats>
          <StatCard libelle={t("Taux du jour", "Today's rate")} valeur={pourcent(p.taux, lang, 1)} detail={t("Toutes classes", "All classes")} ton="succes" />
          <StatCard libelle={t("Absences", "Absences")} valeur={p.absences} detail={t("Aujourd'hui", "Today")} ton="danger" />
          <StatCard libelle={t("Retards", "Late")} valeur={p.retards} detail={t("Aujourd'hui", "Today")} ton="alerte" />
          <StatCard libelle={t("Justificatifs à valider", "Notes to approve")} valeur={p.aJustifier} detail={t("Reçus des parents", "From parents")} />
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
            <LineChart donnees={p.semaine.map((j) => ({ libelle: jourSemaine(j.date, lang), valeur: j.taux }))} min={88} max={100} />
          </Card>
          <Card>
            <CardHeader titre={t("Tâches du jour", "Today's tasks")} />
            <ul className="divide-y divide-line">
              {taches.map(([libelle, n, href]) => (
                <li key={libelle}>
                  <Link href={href} className="flex items-center justify-between py-3 text-sm hover:text-navy-700">
                    {libelle}
                    {n > 0 && <Compteur valeur={n} />}
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
