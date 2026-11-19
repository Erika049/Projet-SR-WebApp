// Route : /[lang]/secretariat/demandes — Demandes de liaison parent-enfant (CU-SEC-05) :
// le parent a saisi le code de liaison dans l'application mobile ; le secrétariat accepte ou refuse.
import Link from "next/link";
import { getLang, getT } from "@/lib/i18n/server";
import { quand } from "@/lib/format";
import { listerDemandesLiaison } from "@/lib/api/backend";
import { traiterLiaison } from "@/features/liaisons/actions";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, Note } from "@/components/ui/card";
import { ActionButton } from "@/components/ui/action-button";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";

export default async function DemandesPage() {
  const [t, lang, liaisons] = await Promise.all([getT(), getLang(), listerDemandesLiaison()]);
  return (
    <>
      <PageHeader titre={t("Demandes de liaison", "Link requests")} sousTitre={t(`${liaisons.length} demande(s) en attente`, `${liaisons.length} pending request(s)`)} />
      <PageBody>
        <Card>
          {liaisons.length === 0 ? (
            <EmptyState titre={t("Aucune demande en attente", "No pending requests")} />
          ) : (
            <ul className="divide-y divide-line">
              {liaisons.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar nom={d.parentNom} />
                    <div className="text-sm">
                      <p className="font-semibold">{d.parentNom}</p>
                      <p className="text-muted">
                        {t("souhaite lier son compte à", "wants to link their account to")}{" "}
                        <Link href={`/${lang}/secretariat/eleves/${d.eleveId}`} className="font-semibold text-navy-700 hover:underline">{d.eleve.prenom} {d.eleve.nom}</Link> · {d.eleve.classe.libelle}
                      </p>
                      <p className="text-xs text-muted">{d.parentTelephone} · {t("code de liaison saisi", "link code entered")} · {quand(d.date, lang)}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <ActionButton action={traiterLiaison.bind(null, d.id, d.eleveId, "refuser")} variante="danger">{t("Refuser", "Reject")}</ActionButton>
                    <ActionButton action={traiterLiaison.bind(null, d.id, d.eleveId, "accepter")} variante="succes">{t("Accepter", "Accept")}</ActionButton>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Note titre={t("Avant d'accepter", "Before accepting")}>
          {t("Vérifiez que le parent est bien celui à qui le code a été remis (téléphone du dossier). Une fois accepté, il voit les notes, absences et paiements de l'enfant.", "Check that the parent is the person the code was given to (phone in the file). Once accepted, they see the child's marks, absences and payments.")}
        </Note>
      </PageBody>
    </>
  );
}
