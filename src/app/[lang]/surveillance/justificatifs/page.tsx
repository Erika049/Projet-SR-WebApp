// Route : /[lang]/surveillance/justificatifs — Justificatifs d'absence (CU-SUR-03). Le parent est notifié de chaque décision.
import { Paperclip } from "lucide-react";
import { getLang, getT } from "@/lib/i18n/server";
import { jourMois } from "@/lib/format";
import { STATUT_JUSTIFICATIF, lib, ton } from "@/lib/labels";
import { premier } from "@/lib/utils";
import { listerJustificatifs } from "@/features/justificatifs/queries";
import { traiterJustificatif } from "@/features/justificatifs/actions";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LigneVide, Table, Td, Th } from "@/components/ui/data-table";
import { Tabs } from "@/components/ui/tabs";
import { Personne } from "@/components/ui/avatar";
import { ActionButton } from "@/components/ui/action-button";
import { Dialog } from "@/components/ui/dialog";

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
                  <Td>{j.motif}</Td>
                  <Td>
                    {j.piece ? (
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
                        <ActionButton action={traiterJustificatif.bind(null, j.id, "refuse")} variante="danger">{t("Refuser", "Reject")}</ActionButton>
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
