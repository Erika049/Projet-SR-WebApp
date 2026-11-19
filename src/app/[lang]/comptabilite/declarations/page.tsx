// Route : /[lang]/comptabilite/declarations — Paiements déclarés par les parents depuis le mobile (CU-PAR-11, CU-ECO-05).
import { getLang, getT } from "@/lib/i18n/server";
import { fcfa, quand } from "@/lib/format";
import { MODE_PAIEMENT, lib } from "@/lib/labels";
import { listerDeclarations } from "@/features/finances/queries";
import { traiterDeclaration } from "@/features/finances/actions";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, Note } from "@/components/ui/card";
import { LigneVide, Table, Td, Th } from "@/components/ui/data-table";
import { Personne } from "@/components/ui/avatar";
import { ActionButton } from "@/components/ui/action-button";

export default async function DeclarationsPage() {
  const [t, lang, liste] = await Promise.all([getT(), getLang(), listerDeclarations()]);
  return (
    <>
      <PageHeader titre={t("Déclarations de paiement", "Payment declarations")} sousTitre={t("Paiements déclarés par les parents, en attente de vérification.", "Payments declared by parents, awaiting verification.")} />
      <PageBody>
        <Card>
          <CardHeader titre={t("Déclarations à vérifier", "Declarations to verify")} />
          <Table>
            <thead>
              <tr>
                <Th>{t("Parent", "Parent")}</Th>
                <Th>{t("Élève", "Student")}</Th>
                <Th>{t("Montant", "Amount")}</Th>
                <Th>{t("Mode", "Method")}</Th>
                <Th>{t("Référence", "Reference")}</Th>
                <Th>{t("Reçue", "Received")}</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {liste.length === 0 && <LigneVide colSpan={7} texte={t("Aucune déclaration en attente.", "No pending declarations.")} />}
              {liste.map((d) => (
                <tr key={d.id}>
                  <Td><Personne nom={d.parentNom} /></Td>
                  <Td>{d.eleve.prenom} {d.eleve.nom} · {d.classe.libelle}</Td>
                  <Td className="font-semibold">{fcfa(d.montant, lang)}</Td>
                  <Td>{lib(MODE_PAIEMENT, d.mode, t)}</Td>
                  <Td className="font-mono text-xs">{d.reference}</Td>
                  <Td className="text-muted">{quand(d.date, lang)}</Td>
                  <Td>
                    <div className="flex justify-end gap-1.5">
                      <ActionButton action={traiterDeclaration.bind(null, d.id, "rejeter")} variante="danger" confirmation={t("Rejeter cette déclaration ? Le parent sera notifié.", "Reject this declaration? The parent will be notified.")}>{t("Rejeter", "Reject")}</ActionButton>
                      <ActionButton action={traiterDeclaration.bind(null, d.id, "valider")} variante="succes">{t("Valider", "Approve")}</ActionButton>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <Note titre={t("Comment ça marche", "How it works")}>
          {t(
            "Le parent déclare son paiement depuis le mobile avec la référence de transaction. Après vérification sur le relevé de l'opérateur ou de la banque, validez : le reçu est émis et le parent est notifié.",
            "The parent declares the payment from the mobile app with the transaction reference. After checking the operator or bank statement, approve: the receipt is issued and the parent is notified.",
          )}
        </Note>
      </PageBody>
    </>
  );
}
