// Route : /[lang]/direction — Tableau de bord de la direction (CU-DIR-01), à partir des données du backend.
import Link from "next/link";
import { CheckCircle2, GraduationCap, Users, Wallet } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/dal";
import { getLang, getT } from "@/lib/i18n/server";
import { aujourdhuiIso, fcfa, jourSemaine, pourcent } from "@/lib/format";
import { classes as lireClasses, impayes as lireImpayes, journalCaisse, personnel, presencesDuJour, repertoire } from "@/lib/api/backend";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { GrilleStats, StatCard } from "@/components/ui/stat-card";
import { LineChart } from "@/components/charts/line-chart";

export default async function TableauDirectionPage() {
  const aujourdhui = aujourdhuiIso();
  const [t, lang, session, eleves, classes, membres, presence, impayes, mois] = await Promise.all([
    getT(), getLang(), getCurrentUser(), repertoire(), lireClasses(), personnel(), presencesDuJour(true), lireImpayes(), journalCaisse(`${aujourdhui.slice(0, 8)}01`, aujourdhui),
  ]);
  const encaisse = mois.filter((p) => p.statut === "VALIDE").reduce((s, p) => s + Number(p.montant), 0);
  const sansParent = eleves.filter((e) => e.liaison !== "LIEE").length;
  const base = `/${lang}/direction`;
  const taches: [string, string][] = [
    ...(presence.aVerifier.length ? [[t(`${presence.aVerifier.length} fiche(s) d'appel en attente du surveillant général`, `${presence.aVerifier.length} roll call(s) waiting for the head of discipline`), `${base}/classes`] as [string, string]] : []),
    ...(presence.appelsManquants.length ? [[t(`Appel non fait : ${presence.appelsManquants.map((c) => c.libelle).join(", ")}`, `No roll call: ${presence.appelsManquants.map((c) => c.libelle).join(", ")}`), `${base}/classes`] as [string, string]] : []),
    ...(impayes.length ? [[t(`${impayes.length} élève(s) en impayé`, `${impayes.length} student(s) in arrears`), `${base}/finances`] as [string, string]] : []),
    ...(sansParent ? [[t(`${sansParent} élève(s) sans parent lié à l'application`, `${sansParent} student(s) without a linked parent`), `${base}/eleves`] as [string, string]] : []),
  ];
  return (
    <>
      <PageHeader titre={t("Tableau de bord", "Dashboard")} sousTitre={`${t("Bonjour", "Hello")} ${session.nomAffiche}${session.etablissementNom ? ` · ${session.etablissementNom}` : ""}`} />
      <PageBody>
        <GrilleStats>
          <StatCard libelle={t("Élèves", "Students")} valeur={eleves.length} detail={t(`${classes.length} classes`, `${classes.length} classes`)} icone={<GraduationCap className="size-5" />} />
          <StatCard libelle={t("Personnel", "Staff")} valeur={membres.length} detail={t(`${membres.filter((m) => m.roles.includes("ENSEIGNANT")).length} enseignants`, `${membres.filter((m) => m.roles.includes("ENSEIGNANT")).length} teachers`)} icone={<Users className="size-5" />} />
          <StatCard libelle={t("Présence aujourd'hui", "Attendance today")} valeur={pourcent(presence.taux, lang, 1)} detail={t(`${presence.absences} absences · ${presence.retards} retards`, `${presence.absences} absences · ${presence.retards} late`)} icone={<CheckCircle2 className="size-5" />} ton="succes" />
          <StatCard libelle={t("Encaissé ce mois", "Collected this month")} valeur={fcfa(encaisse, lang)} detail={t(`${impayes.length} élèves en impayé`, `${impayes.length} students in arrears`)} icone={<Wallet className="size-5" />} />
        </GrilleStats>
        <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
          <Card>
            <CardHeader titre={t("Présence sur 7 jours", "Attendance over 7 days")} />
            {presence.semaine.length === 0 ? (
              <EmptyState titre={t("Aucun appel sur les 7 derniers jours", "No roll call over the last 7 days")} />
            ) : (
              <LineChart donnees={presence.semaine.map((j) => ({ libelle: jourSemaine(j.date, lang), valeur: j.taux }))} min={Math.max(0, Math.floor(Math.min(88, ...presence.semaine.map((j) => j.taux)) / 5) * 5)} max={100} suffixe=" %" />
            )}
          </Card>
          <Card>
            <CardHeader titre={t("À suivre", "To follow up")} />
            {taches.length === 0 ? (
              <EmptyState titre={t("Rien à signaler", "Nothing to report")} />
            ) : (
              <ul className="divide-y divide-line">
                {taches.map(([libelle, href]) => (
                  <li key={libelle}><Link href={href} className="block py-3 text-sm hover:text-navy-700">{libelle}</Link></li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </PageBody>
    </>
  );
}
