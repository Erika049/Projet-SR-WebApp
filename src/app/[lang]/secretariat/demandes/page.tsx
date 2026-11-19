// Route : /[lang]/secretariat/demandes — Demandes de liaison parents (CU-SEC-05) et de correction (CU-SEC-06).
import Link from "next/link";
import { getLang, getT } from "@/lib/i18n/server";
import { quand } from "@/lib/format";
import { STATUT_CORRECTION, lib, ton } from "@/lib/labels";
import { listerDemandesLiaison } from "@/features/liaisons/queries";
import { listerCorrections } from "@/features/eleves/queries";
import { traiterLiaison } from "@/features/liaisons/actions";
import { traiterCorrection } from "@/features/eleves/actions";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, Note } from "@/components/ui/card";
import { Badge, Compteur } from "@/components/ui/badge";
import { ActionButton } from "@/components/ui/action-button";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";

export default async function DemandesPage() {
  const [t, lang, liaisons, corrections] = await Promise.all([getT(), getLang(), listerDemandesLiaison(), listerCorrections()]);
  const ouvertes = corrections.filter((c) => c.statut === "a_traiter" || c.statut === "attente_directeur");
  return (
    <>
      <PageHeader titre={t("Demandes", "Requests")} sousTitre={t(`${liaisons.length} liaisons parents · ${ouvertes.length} corrections`, `${liaisons.length} parent links · ${ouvertes.length} corrections`)} />
      <PageBody>
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader titre={<span className="flex items-center gap-2">{t("Demandes de liaison parents", "Parent link requests")} <Compteur valeur={liaisons.length} /></span>} />
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
                        <p className="text-xs text-muted">{d.parentTelephone} {d.parentTelephone === d.eleve.tuteur.telephone ? <Badge ton="succes" className="ml-1">{t("Numéro du tuteur déclaré", "Matches declared guardian")}</Badge> : <Badge ton="alerte" className="ml-1">{t("Numéro différent", "Different number")}</Badge>} · {quand(d.date, lang)}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <ActionButton action={traiterLiaison.bind(null, d.id, "refuser")} variante="danger">{t("Refuser", "Reject")}</ActionButton>
                      <ActionButton action={traiterLiaison.bind(null, d.id, "accepter")} variante="succes">{t("Accepter", "Accept")}</ActionButton>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <div className="space-y-6">
            <Card>
              <CardHeader titre={<span className="flex items-center gap-2">{t("Demandes de correction", "Correction requests")} <Compteur valeur={ouvertes.length} /></span>} />
              {ouvertes.length === 0 ? (
                <EmptyState titre={t("Aucune demande", "No requests")} />
              ) : (
                <ul className="divide-y divide-line">
                  {ouvertes.map((c) => (
                    <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                      <div>
                        <p className="font-semibold">{c.eleve.prenom} {c.eleve.nom} <span className="font-normal text-muted">· {c.eleve.classe.libelle}</span></p>
                        <p className="text-muted">{c.champ} : {c.ancienneValeur} → <strong className="text-ink">{c.nouvelleValeur}</strong></p>
                        <p className="text-xs text-muted">{c.demandeur} · {quand(c.date, lang)}</p>
                      </div>
                      {c.statut === "a_traiter" ? (
                        <div className="flex gap-1.5">
                          <ActionButton action={traiterCorrection.bind(null, c.id, "refuser")} variante="danger">{t("Refuser", "Reject")}</ActionButton>
                          <ActionButton action={traiterCorrection.bind(null, c.id, "accepter")} variante="succes">{c.identite ? t("Transmettre au directeur", "Send to principal") : t("Appliquer", "Apply")}</ActionButton>
                        </div>
                      ) : (
                        <Badge ton={ton(STATUT_CORRECTION, c.statut)}>{lib(STATUT_CORRECTION, c.statut, t)}</Badge>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Note titre={t("Règle de délégation", "Delegation rule")}>
              {t("Les corrections d'identité (nom, naissance) sont envoyées au directeur pour validation avant d'être appliquées au dossier de l'élève.", "Identity corrections (name, birth) are sent to the principal for approval before being applied to the student's file.")}
            </Note>
          </div>
        </div>
      </PageBody>
    </>
  );
}
