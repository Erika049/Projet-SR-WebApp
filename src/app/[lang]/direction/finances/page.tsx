// Route : /[lang]/direction/finances — Encaissements du mois, impayés et paiements récents (CU-DIR-07).
import { getLang, getT } from "@/lib/i18n/server";
import { aujourdhuiIso, dateCourte, fcfa } from "@/lib/format";
import { MODE_PAIEMENT, lib } from "@/lib/labels";
import { MODES, impayes as lireImpayes, journalCaisse } from "@/lib/api/backend";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GrilleStats, StatCard } from "@/components/ui/stat-card";
import { LigneVide, Table, Td, Th } from "@/components/ui/data-table";

export default async function FinancesPage() {
  const aujourdhui = aujourdhuiIso();
  const debutMois = `${aujourdhui.slice(0, 8)}01`;
  const debutAnnee = `${Number(aujourdhui.slice(0, 4)) - (Number(aujourdhui.slice(5, 7)) < 9 ? 1 : 0)}-09-01`;
  const [t, lang, impayes, mois, annee] = await Promise.all([getT(), getLang(), lireImpayes(), journalCaisse(debutMois, aujourdhui), journalCaisse(debutAnnee, aujourdhui)]);
  const valides = (l: typeof mois) => l.filter((p) => p.statut === "VALIDE");
  const total = (l: typeof mois) => valides(l).reduce((s, p) => s + Number(p.montant), 0);
  const resteDu = impayes.reduce((s, i) => s + Number(i.solde), 0);
  return (
    <>
      <PageHeader titre={t("Finances", "Finance")} sousTitre={t("Chiffres issus des paiements enregistrés par l'économat.", "Figures from payments recorded by the bursar.")} />
      <PageBody>
        <GrilleStats>
          <StatCard libelle={t("Encaissé ce mois", "Collected this month")} valeur={fcfa(total(mois), lang)} detail={t(`${valides(mois).length} paiements`, `${valides(mois).length} payments`)} ton="succes" />
          <StatCard libelle={t("Encaissé depuis la rentrée", "Collected since September")} valeur={fcfa(total(annee), lang)} detail={t(`${valides(annee).length} paiements`, `${valides(annee).length} payments`)} />
          <StatCard libelle={t("Reste à percevoir", "Outstanding")} valeur={fcfa(resteDu, lang)} detail={t(`${impayes.length} élèves`, `${impayes.length} students`)} ton="danger" />
          <StatCard libelle={t("Paiements annulés", "Cancelled payments")} valeur={annee.length - valides(annee).length} detail={t("Depuis la rentrée", "Since September")} ton="alerte" />
        </GrilleStats>
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader titre={t("Plus gros impayés", "Largest arrears")} />
            <Table>
              <thead><tr><Th>{t("Élève", "Student")}</Th><Th>{t("Dû", "Due")}</Th><Th>{t("Payé", "Paid")}</Th><Th>{t("Reste", "Balance")}</Th></tr></thead>
              <tbody>
                {impayes.length === 0 && <LigneVide colSpan={4} texte={t("Aucun impayé.", "No arrears.")} />}
                {impayes.slice(0, 10).map((i) => (
                  <tr key={i.eleveId}>
                    <Td className="font-semibold">{i.eleve.prenom} {i.eleve.nom}</Td>
                    <Td>{fcfa(Number(i.totalDu), lang)}</Td>
                    <Td>{fcfa(Number(i.totalPaye), lang)}</Td>
                    <Td className="font-semibold text-red-700">{fcfa(Number(i.solde), lang)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
          <Card>
            <CardHeader titre={t("Paiements du mois", "Payments this month")} />
            <Table>
              <thead><tr><Th>{t("Date", "Date")}</Th><Th>{t("Élève", "Student")}</Th><Th>{t("Montant", "Amount")}</Th><Th>{t("Mode", "Method")}</Th></tr></thead>
              <tbody>
                {mois.length === 0 && <LigneVide colSpan={4} texte={t("Aucun paiement ce mois-ci.", "No payment this month.")} />}
                {mois.slice(0, 12).map((p) => (
                  <tr key={p.id}>
                    <Td className="text-muted">{dateCourte(p.date, lang)}</Td>
                    <Td>{p.elevePrenom} {p.eleveNom}</Td>
                    <Td className="font-semibold">{fcfa(Number(p.montant), lang)} {p.statut === "ANNULE" && <Badge ton="danger">{t("Annulé", "Cancelled")}</Badge>}</Td>
                    <Td>{lib(MODE_PAIEMENT, MODES[p.mode], t)}</Td>
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
