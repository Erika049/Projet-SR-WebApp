// Route : /[lang]/comptabilite/declarations — Paiements déclarés par les parents depuis le mobile (CU-PAR-11, CU-ECO-05).
import { Paperclip } from "lucide-react";
import { getLang, getT } from "@/lib/i18n/server";
import { dateCourte, fcfa } from "@/lib/format";
import { MODE_PAIEMENT, lib } from "@/lib/labels";
import { listerDeclarations } from "@/lib/api/backend";
import { traiterDeclaration } from "@/features/finances/actions";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, Note } from "@/components/ui/card";
import { LigneVide, Table, Td, Th } from "@/components/ui/data-table";
import { Personne } from "@/components/ui/avatar";
import { ActionButton } from "@/components/ui/action-button";
import { Dialog } from "@/components/ui/dialog";
import { SubmitButton } from "@/components/ui/submit-button";

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
                <Th>{t("Payé le", "Paid on")}</Th>
                <Th>{t("Preuve", "Proof")}</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {liste.length === 0 && <LigneVide colSpan={8} texte={t("Aucune déclaration en attente.", "No pending declarations.")} />}
              {liste.map((d) => (
                <tr key={d.id}>
                  <Td>
                    <Personne nom={d.parentNom} />
                    {d.parentTelephone && <p className="text-xs text-muted">{d.parentTelephone}</p>}
                  </Td>
                  <Td>
                    {d.eleve.prenom} {d.eleve.nom} · {d.classe.libelle}
                    {d.soldeEleve !== null && <p className="text-xs text-muted">{t("Reste à payer", "Balance due")} : {fcfa(d.soldeEleve, lang)}</p>}
                  </Td>
                  <Td className="font-semibold">{fcfa(d.montant, lang)}</Td>
                  <Td>{lib(MODE_PAIEMENT, d.mode, t)}</Td>
                  <Td className="font-mono text-xs">{d.reference}</Td>
                  <Td className="text-muted">{dateCourte(d.date, lang)}</Td>
                  <Td>
                    {d.preuveUrl ? (
                      <a href={d.preuveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-navy-700 hover:underline">
                        <Paperclip className="size-3.5" /> {d.preuveNom}
                      </a>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </Td>
                  <Td>
                    <div className="flex justify-end gap-1.5">
                      <Dialog declencheur={t("Rejeter", "Reject")} titre={t("Rejeter la déclaration", "Reject the declaration")} variante="danger">
                        <form action={traiterDeclaration.bind(null, d.id, "rejeter")} className="space-y-3">
                          <label className="block text-sm font-medium text-ink" htmlFor={`motif-${d.id}`}>
                            {t("Motif transmis au parent", "Reason sent to the parent")}
                          </label>
                          <textarea
                            id={`motif-${d.id}`}
                            name="motif"
                            rows={3}
                            maxLength={500}
                            required
                            defaultValue={t("Paiement introuvable sur le relevé de l'opérateur ou de la banque.", "Payment not found on the operator or bank statement.")}
                            className="w-full rounded-lg border border-line px-3 py-2 text-sm"
                          />
                          <div className="flex justify-end">
                            <SubmitButton variante="danger" taille="sm">{t("Confirmer le rejet", "Confirm rejection")}</SubmitButton>
                          </div>
                        </form>
                      </Dialog>
                      <ActionButton
                        action={traiterDeclaration.bind(null, d.id, "valider")}
                        variante="succes"
                        confirmation={t("Valider ce paiement ? Le reçu sera émis et le parent notifié.", "Approve this payment? The receipt will be issued and the parent notified.")}
                      >
                        {t("Valider", "Approve")}
                      </ActionButton>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <Note titre={t("Comment ça marche", "How it works")}>
          {t(
            "Le parent déclare son paiement depuis le mobile avec la référence de transaction et une preuve (capture, reçu). Après vérification sur le relevé de l'opérateur ou de la banque, validez : le paiement est enregistré, le reçu est émis et le parent est notifié.",
            "The parent declares the payment from the mobile app with the transaction reference and a proof (screenshot, receipt). After checking the operator or bank statement, approve: the payment is recorded, the receipt is issued and the parent is notified.",
          )}
        </Note>
      </PageBody>
    </>
  );
}
