// Route : /[lang]/direction/finances — Rapports financiers (CU-DIR-07) + validation des annulations de paiement.
import { getLang, getT } from "@/lib/i18n/server";
import { fcfa, jourMois, millions, moisCourt, nombre } from "@/lib/format";
import { MODE_PAIEMENT, lib } from "@/lib/labels";
import { annulationsEnAttente, rapportFinancier } from "@/features/finances/queries";
import { traiterAnnulation } from "@/features/finances/actions";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Table, Td, Th } from "@/components/ui/data-table";
import { GrilleStats, StatCard } from "@/components/ui/stat-card";
import { Personne } from "@/components/ui/avatar";
import { ActionButton } from "@/components/ui/action-button";
import { BarChart } from "@/components/charts/bar-chart";
import { DonutChart } from "@/components/charts/donut-chart";

const COULEURS = ["#f5b800", "#ff7900", "#0e7c5a", "#173f73"];

export default async function RapportsFinanciersPage() {
  const [t, lang, r, annulations] = await Promise.all([getT(), getLang(), rapportFinancier(), annulationsEnAttente()]);
  return (
    <>
      <PageHeader
        titre={t("Rapports financiers", "Financial reports")}
        sousTitre={t("Année 2026-2027 · Consultation des encaissements saisis par la comptabilité", "Year 2026-2027 · Collections recorded by accounting")}
        actions={<ButtonLink href={`/api/exports/rapport-financier?lang=${lang}`} variante="secondaire" prefetch={false}>{t("Exporter Excel", "Export Excel")}</ButtonLink>}
      />
      <PageBody>
        <GrilleStats>
          <StatCard libelle={t("Frais attendus", "Expected fees")} valeur={millions(r.attendu, lang)} detail={t("FCFA · année 2026-2027", "FCFA · year 2026-2027")} />
          <StatCard libelle={t("Frais encaissés", "Collected")} valeur={millions(r.encaisse, lang)} detail={t(`${r.taux} % du total`, `${r.taux}% of total`)} ton="succes" />
          <StatCard libelle={t("Reste à encaisser", "Outstanding")} valeur={millions(r.reste, lang)} detail="FCFA" ton="alerte" />
          <StatCard libelle={t("Remises accordées", "Discounts granted")} valeur={millions(r.remises, lang)} detail="FCFA" />
        </GrilleStats>

        {annulations.length > 0 && (
          <Card className="border-amber-200">
            <CardHeader titre={t("Annulations de paiement à valider", "Payment cancellations to approve")} sousTitre={t("Toute annulation exige un motif et la validation de la direction.", "Every cancellation requires a reason and management approval.")} />
            <Table>
              <thead>
                <tr>
                  <Th>{t("Reçu", "Receipt")}</Th>
                  <Th>{t("Élève", "Student")}</Th>
                  <Th>{t("Montant", "Amount")}</Th>
                  <Th>{t("Motif", "Reason")}</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {annulations.map(({ paiement: p, eleve }) => (
                  <tr key={p.id}>
                    <Td className="font-mono text-xs">{p.numeroRecu}</Td>
                    <Td>{eleve.prenom} {eleve.nom}</Td>
                    <Td className="font-semibold">{fcfa(p.montant, lang)}</Td>
                    <Td className="text-muted">{p.motifAnnulation}</Td>
                    <Td>
                      <div className="flex justify-end gap-1.5">
                        <ActionButton action={traiterAnnulation.bind(null, p.id, "refuser")} variante="secondaire">{t("Refuser", "Reject")}</ActionButton>
                        <ActionButton action={traiterAnnulation.bind(null, p.id, "valider")} variante="danger" confirmation={t("Annuler définitivement ce paiement ?", "Permanently cancel this payment?")}>{t("Valider l'annulation", "Approve cancellation")}</ActionButton>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        )}

        <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
          <Card>
            <CardHeader titre={t("Encaissements par mois", "Collections per month")} action={<span className="text-xs text-muted">{t("en millions de FCFA", "in millions FCFA")}</span>} />
            <BarChart donnees={r.mois.map((m, i, arr) => ({ libelle: moisCourt(m.mois, lang), valeur: Math.round(m.montant / 100_000) / 10, accent: i === arr.length - 1 }))} format={(v) => nombre(v, lang, v % 1 ? 1 : 0)} />
          </Card>
          <Card>
            <CardHeader titre={t("Modes de paiement", "Payment methods")} />
            <DonutChart
              parts={r.parMode.map((p, i) => ({ libelle: lib(MODE_PAIEMENT, p.mode, t), valeur: p.montant, couleur: COULEURS[i] }))}
              format={(v) => `${Math.round((v / Math.max(1, r.encaisse)) * 100)} %`}
            />
          </Card>
        </div>

        <Card>
          <CardHeader titre={t("Plus gros impayés", "Largest arrears")} />
          <Table>
            <thead>
              <tr>
                <Th>{t("Élève", "Student")}</Th>
                <Th>{t("Classe", "Class")}</Th>
                <Th>{t("Montant dû", "Amount due")}</Th>
                <Th>{t("Retard", "Overdue")}</Th>
                <Th>{t("Dernière relance", "Last reminder")}</Th>
              </tr>
            </thead>
            <tbody>
              {r.plusGrosImpayes.map((s) => (
                <tr key={s.eleve.id}>
                  <Td><Personne nom={`${s.eleve.prenom} ${s.eleve.nom}`} /></Td>
                  <Td>{s.classe?.libelle}</Td>
                  <Td className="font-semibold text-red-600">{fcfa(s.montantEchu, lang)}</Td>
                  <Td>{t(`${s.retardJours} jours`, `${s.retardJours} days`)}</Td>
                  <Td className="text-muted">{s.derniereRelance ? jourMois(s.derniereRelance, lang) : t("Jamais", "Never")}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </PageBody>
    </>
  );
}
