// Route : /[lang]/surveillance/justificatifs — Justificatifs d'absence (CU-SUR-03). Le parent est notifié de chaque décision.
import { Paperclip } from "lucide-react";
import { getLang, getT } from "@/lib/i18n/server";
import { jourMois } from "@/lib/format";
import { STATUT_JUSTIFICATIF, lib, ton } from "@/lib/labels";
import { premier } from "@/lib/utils";
import { listerJustificatifs } from "@/lib/api/backend";
import { traiterJustificatif } from "@/features/justificatifs/actions";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LigneVide, Table, Td, Th } from "@/components/ui/data-table";
import { Tabs } from "@/components/ui/tabs";
import { Personne } from "@/components/ui/avatar";
import { ActionButton } from "@/components/ui/action-button";
import { Dialog } from "@/components/ui/dialog";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function JustificatifsPage({ searchParams }: PageProps<"/[lang]/surveillance/justificatifs">) {
  const [sp, t, lang] = await Promise.all([searchParams, getT(), getLang()]);
  const traites = premier(sp.vue) === "traites";
  const [attente, faits] = await Promise.all([listerJustificatifs("en_attente"), listerJustificatifs("traites")]);
  const liste = traites ? faits : attente;
  const base = `/${lang}/surveillance/justificatifs`;

  return (
    <>
      <PageHeader titre={t("Justificatifs d'absence", "Absence notes")} sousTitre={t("Le parent est notifié de chaque décision.", "The parent is notified of every decision.")} />
      <PageBody>
        <Tabs
          onglets={[
            { href: base, libelle: t("À valider", "To approve"), compteur: attente.length },
            { href: `${base}?vue=traites`, libelle: t("Traités", "Processed"), compteur: faits.length },
          ]}
        />
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>{t("Élève", "Student")}</Th>
                <Th>{t("Classe", "Class")}</Th>
                <Th>{t("Absence", "Absence")}</Th>
                <Th>{t("Motif", "Reason")}</Th>
                <Th>{t("Pièce", "Attachment")}</Th>
                <Th>{traites ? t("Décision", "Decision") : ""}</Th>
              </tr>
            </thead>
            <tbody>
              {liste.length === 0 && <LigneVide colSpan={6} texte={t("Aucun justificatif.", "No absence notes.")} />}
              {liste.map((j) => (
                <tr key={j.id}>
                  <Td><Personne nom={`${j.eleve.prenom} ${j.eleve.nom}`} /></Td>
                  <Td>{j.eleve.classe.libelle}</Td>
                  <Td className="whitespace-nowrap">{jourMois(j.dateAbsence, lang)} · {j.heures}</Td>
                  <Td>
                    {j.motif}
                    {j.parent && <p className="text-xs text-muted">{t("Déposé par", "Sent by")} {j.parent}</p>}
                    {j.commentaire && <p className="text-xs text-muted">{t("Commentaire", "Comment")} : {j.commentaire}</p>}
                  </Td>
                  <Td>
                    {j.piece && j.pieceUrl ? (
                      <a href={j.pieceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-navy-700 hover:underline">
                        <Paperclip className="size-3.5" /> {j.piece}
                      </a>
                    ) : j.piece ? (
                      <Dialog declencheur={<><Paperclip className="size-3.5" /> {j.piece}</>} titre={j.piece} variante="fantome">
                        <div className="grid h-64 place-items-center rounded-xl border border-dashed border-line bg-slate-50 text-sm text-muted">
                          {t("Aperçu du document (stockage sécurisé des pièces justificatives)", "Document preview (secure attachment storage)")}
                        </div>
                      </Dialog>
                    ) : (
                      <span className="text-xs text-muted">{t("Aucune pièce", "No attachment")}</span>
                    )}
                  </Td>
                  <Td>
                    {traites ? (
                      <Badge ton={ton(STATUT_JUSTIFICATIF, j.statut)}>{lib(STATUT_JUSTIFICATIF, j.statut, t)}</Badge>
                    ) : (
                      <div className="flex justify-end gap-1.5">
                        <Dialog declencheur={t("Refuser", "Reject")} titre={t("Refuser le justificatif", "Reject the absence note")} variante="danger">
                          <form action={traiterJustificatif.bind(null, j.id, "refuse")} className="space-y-3">
                            <label className="block text-sm font-medium text-ink" htmlFor={`commentaire-${j.id}`}>
                              {t("Commentaire pour le parent (facultatif)", "Comment for the parent (optional)")}
                            </label>
                            <textarea id={`commentaire-${j.id}`} name="commentaire" rows={3} maxLength={1000} className="w-full rounded-lg border border-line px-3 py-2 text-sm" />
                            <div className="flex justify-end">
                              <SubmitButton variante="danger" taille="sm">{t("Confirmer le refus", "Confirm rejection")}</SubmitButton>
                            </div>
                          </form>
                        </Dialog>
                        <ActionButton action={traiterJustificatif.bind(null, j.id, "accepte")} variante="succes">{t("Valider", "Approve")}</ActionButton>
                      </div>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </PageBody>
    </>
  );
}
