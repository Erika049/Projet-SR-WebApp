// Route : /[lang]/comptabilite/impayes — Élèves en impayé et relance des parents (CU-ECO-06, CU-SYS-03).
import Link from "next/link";
import { getLang, getT } from "@/lib/i18n/server";
import { fcfa } from "@/lib/format";
import { impayes as lireImpayes } from "@/lib/api/backend";
import { relancerImpayes } from "@/features/finances/actions";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { GrilleStats, StatCard } from "@/components/ui/stat-card";
import { LigneVide, Table, Td, Th } from "@/components/ui/data-table";
import { Formulaire } from "@/components/ui/formulaire";

export default async function ImpayesPage() {
  const [t, lang, impayes] = await Promise.all([getT(), getLang(), lireImpayes()]);
  const total = impayes.reduce((s, i) => s + Number(i.solde), 0);
  return (
    <>
      <PageHeader titre={t("Impayés", "Arrears")} />
      <PageBody>
        <GrilleStats>
          <StatCard libelle={t("Élèves concernés", "Students")} valeur={impayes.length} ton="alerte" />
          <StatCard libelle={t("Reste à percevoir", "Outstanding")} valeur={fcfa(total, lang)} ton="danger" />
        </GrilleStats>
        <Card>
          <CardHeader
            titre={t("Liste des impayés", "Arrears list")}
            sousTitre={t("La relance prévient les parents des montants échus non réglés (notification mobile).", "The reminder notifies parents of overdue unpaid amounts (mobile notification).")}
            action={
              impayes.length > 0 ? (
                <Formulaire action={relancerImpayes} libelle={t("Relancer tous les parents", "Remind all parents")} variante="secondaire" confirmation={t("Relancer les parents de tous les élèves en impayé échu ?", "Remind the parents of every student with overdue fees?")}>
                  <span />
                </Formulaire>
              ) : undefined
            }
          />
          <Table>
            <thead><tr><Th>{t("Élève", "Student")}</Th><Th>{t("Dû", "Due")}</Th><Th>{t("Payé", "Paid")}</Th><Th>{t("Reste", "Balance")}</Th></tr></thead>
            <tbody>
              {impayes.length === 0 && <LigneVide colSpan={4} texte={t("Aucun impayé.", "No arrears.")} />}
              {impayes.map((i) => (
                <tr key={i.eleveId}>
                  <Td><Link href={`/${lang}/comptabilite/situation/${i.eleveId}`} className="font-semibold text-navy-700 hover:underline">{i.eleve.prenom} {i.eleve.nom}</Link></Td>
                  <Td>{fcfa(Number(i.totalDu), lang)}</Td>
                  <Td>{fcfa(Number(i.totalPaye), lang)}</Td>
                  <Td className="font-semibold text-red-700">{fcfa(Number(i.solde), lang)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </PageBody>
    </>
  );
}
