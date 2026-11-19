// Route : /[lang]/comptabilite/rapports — Rapports de caisse journaliers et périodiques (CU-ECO-08) et exports (CU-ECO-09).
import { getLang, getT } from "@/lib/i18n/server";
import { dateCourte, fcfa, millions, moisCourt, nombre } from "@/lib/format";
import { rapportFinancier } from "@/features/finances/queries";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Table, Td, Th } from "@/components/ui/data-table";
import { GrilleStats, StatCard } from "@/components/ui/stat-card";
import { BarChart } from "@/components/charts/bar-chart";

export default async function RapportsCaissePage() {
  const [t, lang, r] = await Promise.all([getT(), getLang(), rapportFinancier()]);
  return (
    <>
      <PageHeader
        titre={t("Rapports de caisse", "Cash reports")}
        sousTitre={t("Encaissements journaliers et mensuels, exportables pour la comptabilité.", "Daily and monthly collections, exportable for accounting.")}
        actions={
          <>
            <ButtonLink href={`/api/exports/rapport-financier?lang=${lang}`} variante="secondaire" prefetch={false}>{t("Exporter le rapport", "Export report")}</ButtonLink>
            <ButtonLink href={`/api/exports/paiements?lang=${lang}`} prefetch={false}>{t("Exporter tous les paiements", "Export all payments")}</ButtonLink>
          </>
        }
      />
      <PageBody>
        <GrilleStats>
          <StatCard libelle={t("Encaissé (année)", "Collected (year)")} valeur={millions(r.encaisse, lang)} detail="FCFA" ton="succes" />
          <StatCard libelle={t("Attendu", "Expected")} valeur={millions(r.attendu, lang)} detail="FCFA" />
          <StatCard libelle={t("Reste à encaisser", "Outstanding")} valeur={millions(r.reste, lang)} detail="FCFA" ton="alerte" />
          <StatCard libelle={t("Taux de recouvrement", "Collection rate")} valeur={`${r.taux} %`} />
        </GrilleStats>
        <Card>
          <CardHeader titre={t("Encaissements par mois", "Collections per month")} action={<span className="text-xs text-muted">{t("en millions de FCFA", "in millions FCFA")}</span>} />
          <BarChart donnees={r.mois.map((m, i, arr) => ({ libelle: moisCourt(m.mois, lang), valeur: Math.round(m.montant / 100_000) / 10, accent: i === arr.length - 1 }))} format={(v) => nombre(v, lang, v % 1 ? 1 : 0)} />
        </Card>
        <Card>
          <CardHeader titre={t("Caisse journalière", "Daily register")} sousTitre={t("10 derniers jours d'encaissement", "Last 10 collection days")} />
          <Table>
            <thead>
              <tr>
                <Th>{t("Date", "Date")}</Th>
                <Th>{t("Espèces", "Cash")}</Th>
                <Th>Mobile Money</Th>
                <Th>{t("Virements", "Transfers")}</Th>
                <Th>{t("Total", "Total")}</Th>
                <Th>{t("Paiements", "Payments")}</Th>
                <Th>{t("Clôture", "Closing")}</Th>
              </tr>
            </thead>
            <tbody>
              {r.jours.map((j) => (
                <tr key={j.date}>
                  <Td className="font-semibold">{dateCourte(j.date, lang)}</Td>
                  <Td>{fcfa(j.especes, lang)}</Td>
                  <Td>{fcfa(j.mobile, lang)}</Td>
                  <Td>{fcfa(j.autres, lang)}</Td>
                  <Td className="font-bold">{fcfa(j.total, lang)}</Td>
                  <Td>{j.nombre}</Td>
                  <Td>{j.cloture ? <Badge ton="navy">{t("Clôturée", "Closed")} · {j.cloture.par}</Badge> : <Badge ton="neutre">{t("Ouverte", "Open")}</Badge>}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </PageBody>
    </>
  );
}
