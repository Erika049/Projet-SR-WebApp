// Route : /[lang]/direction — Tableau de bord de la direction (CU-DIR-01).
import Link from "next/link";
import { CheckCircle2, GraduationCap, Users, Wallet } from "lucide-react";
import { getLang, getT } from "@/lib/i18n/server";
import { fcfa, jourSemaine, millions, moisCourt, nombre, pourcent } from "@/lib/format";
import { MODE_PAIEMENT, STATUT_PAIEMENT, lib, ton } from "@/lib/labels";
import { tableauDirection } from "@/features/tableaux-de-bord/queries";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { GrilleStats, StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, Compteur } from "@/components/ui/badge";
import { Table, Td, Th } from "@/components/ui/data-table";
import { Personne } from "@/components/ui/avatar";
import { BarChart } from "@/components/charts/bar-chart";
import { LineChart } from "@/components/charts/line-chart";

export default async function TableauDeBordDirectionPage() {
  const [t, lang, d] = await Promise.all([getT(), getLang(), tableauDirection()]);
  const aTraiter: [string, number, string, "alerte" | "danger" | "info"][] = [
    [t("Bulletins à valider", "Report cards to approve"), d.aTraiter.bulletins, "/direction/notes-bulletins", "alerte"],
    [t("Corrections d'identité à valider", "Identity corrections to approve"), d.aTraiter.corrections, "/direction/utilisateurs", "info"],
    [t("Annulations de paiement à valider", "Payment cancellations to approve"), d.aTraiter.annulations, "/direction/finances", "info"],
    [t("Impayés de plus de 30 jours", "Arrears over 30 days"), d.aTraiter.impayes30, "/direction/finances", "danger"],
    [t("Enseignants absents ce mois", "Teachers absent this month"), d.aTraiter.enseignantsAbsents, "/direction/assiduite-personnel", "alerte"],
  ];

  return (
    <>
      <PageHeader titre={t("Tableau de bord", "Dashboard")} sousTitre={`Lycée bilingue de Bafoussam · ${t("Année", "Year")} 2026-2027`} />
      <PageBody>
        <GrilleStats>
          <StatCard libelle={t("Élèves inscrits", "Enrolled students")} valeur={nombre(d.eleves.total, lang)} detail={t(`+${d.eleves.nouveauxMois} ce mois`, `+${d.eleves.nouveauxMois} this month`)} icone={<GraduationCap className="size-5" />} />
          <StatCard libelle={t("Personnel", "Staff")} valeur={d.personnel.total} detail={t(`${d.personnel.enseignants} enseignants`, `${d.personnel.enseignants} teachers`)} icone={<Users className="size-5" />} />
          <StatCard libelle={t("Présence aujourd'hui", "Attendance today")} valeur={pourcent(d.presence.taux, lang, 1)} detail={t(`${d.presence.absences} absences · ${d.presence.retards} retards`, `${d.presence.absences} absences · ${d.presence.retards} late`)} icone={<CheckCircle2 className="size-5" />} ton="succes" />
          <StatCard libelle={t("Frais encaissés", "Fees collected")} valeur={pourcent(d.finances.taux, lang)} detail={`${millions(d.finances.encaisse, lang)} / ${millions(d.finances.attendu, lang)} FCFA`} icone={<Wallet className="size-5" />} ton="alerte" />
        </GrilleStats>

        <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
          <Card>
            <CardHeader titre={t("Encaissements par mois", "Collections per month")} action={<span className="text-xs text-muted">{t("en millions de FCFA", "in millions FCFA")}</span>} />
            <BarChart
              donnees={d.finances.mois.map((m, i, arr) => ({ libelle: moisCourt(m.mois, lang), valeur: Math.round(m.montant / 100_000) / 10, accent: i === arr.length - 1 }))}
              format={(v) => nombre(v, lang, v % 1 ? 1 : 0)}
            />
          </Card>
          <Card>
            <CardHeader titre={t("Présence sur 7 jours", "Attendance over 7 days")} />
            <LineChart donnees={d.presence.semaine.map((j) => ({ libelle: jourSemaine(j.date, lang), valeur: j.taux }))} min={88} max={100} suffixe=" %" />
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[2fr_3fr]">
          <Card>
            <CardHeader titre={t("À traiter", "To do")} />
            <ul className="divide-y divide-line">
              {aTraiter.map(([libelle, n, href, tn]) => (
                <li key={libelle}>
                  <Link href={`/${lang}${href}`} className="flex items-center justify-between py-3 text-sm hover:text-navy-700">
                    {libelle}
                    <Compteur valeur={n} ton={n ? tn : "neutre"} />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardHeader titre={t("Derniers paiements", "Latest payments")} action={<Link href={`/${lang}/direction/finances`} className="text-sm font-semibold text-navy-700 hover:underline">{t("Voir tout", "See all")}</Link>} />
            <Table>
              <thead>
                <tr>
                  <Th>{t("Élève", "Student")}</Th>
                  <Th>{t("Classe", "Class")}</Th>
                  <Th>{t("Montant", "Amount")}</Th>
                  <Th>{t("Mode", "Method")}</Th>
                  <Th>{t("Statut", "Status")}</Th>
                </tr>
              </thead>
              <tbody>
                {d.derniersPaiements.map((p) => (
                  <tr key={p.id}>
                    <Td><Personne nom={`${p.eleve.prenom} ${p.eleve.nom}`} /></Td>
                    <Td>{p.classe.libelle}</Td>
                    <Td className="font-semibold">{fcfa(p.montant, lang)}</Td>
                    <Td>{lib(MODE_PAIEMENT, p.mode, t)}</Td>
                    <Td><Badge ton={ton(STATUT_PAIEMENT, p.statut)}>{lib(STATUT_PAIEMENT, p.statut, t)}</Badge></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>
      </PageBody>
    </>
  );
}
