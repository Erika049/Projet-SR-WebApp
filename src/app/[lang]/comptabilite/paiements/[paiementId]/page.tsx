// Route : /[lang]/comptabilite/paiements/[paiementId] — Reçu numérique (PDF du backend) et annulation (CU-ECO-03, CU-ECO-07).
import { notFound } from "next/navigation";
import { CheckCircle2, FileDown } from "lucide-react";
import { getLang, getT } from "@/lib/i18n/server";
import { dateCourte, fcfa, quand } from "@/lib/format";
import { MODE_PAIEMENT, lib } from "@/lib/labels";
import { premier } from "@/lib/utils";
import { MODES, etablissement, lienFichier, paiement } from "@/lib/api/backend";
import { annulerPaiement } from "@/features/finances/actions";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, Details } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Field, Textarea } from "@/components/ui/form-field";
import { Formulaire } from "@/components/ui/formulaire";

export default async function RecuPage({ params, searchParams }: PageProps<"/[lang]/comptabilite/paiements/[paiementId]">) {
  const [{ paiementId }, sp, t, lang] = await Promise.all([params, searchParams, getT(), getLang()]);
  const p = await paiement(paiementId);
  if (!p) notFound();
  const E = await etablissement();
  const annule = p.statut === "ANNULE";
  return (
    <>
      <PageHeader
        titre={t(`Reçu n° ${p.numeroRecu}`, `Receipt no. ${p.numeroRecu}`)}
        filAriane={[{ href: `/${lang}/comptabilite/situation/${p.eleveId}`, libelle: `${p.elevePrenom} ${p.eleveNom}` }]}
        actions={
          <>
            <Badge ton={annule ? "danger" : "succes"}>{annule ? t("Annulé", "Cancelled") : t("Valide", "Valid")}</Badge>
            <a href={lienFichier(`etablissements/${E}/eleves/${p.eleveId}/paiements/${p.id}/recu`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-navy-700 px-4 py-2 text-sm font-semibold text-white">
              <FileDown className="size-4" /> {t("Reçu PDF", "PDF receipt")}
            </a>
          </>
        }
      />
      <PageBody>
        {premier(sp.nouveau) === "1" && (
          <p className="flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700">
            <CheckCircle2 className="size-5" /> {t("Paiement enregistré. Les parents sont notifiés dans l'application mobile.", "Payment saved. The parents are notified in the mobile app.")}
          </p>
        )}
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader titre={t("Détail du paiement", "Payment details")} />
            <Details
              lignes={[
                [t("Élève", "Student"), `${p.elevePrenom} ${p.eleveNom}${p.classeNom ? ` · ${p.classeNom}` : ""}`],
                [t("Montant", "Amount"), fcfa(Number(p.montant), lang)],
                [t("Date", "Date"), dateCourte(p.date, lang)],
                [t("Mode", "Method"), lib(MODE_PAIEMENT, MODES[p.mode], t)],
                [t("Référence", "Reference"), p.reference ?? "—"],
                [t("Encaissé par", "Received by"), p.encaissePar ?? "—"],
                ...(annule
                  ? ([
                      [t("Annulé par", "Cancelled by"), `${p.annulePar ?? "—"}${p.annuleLe ? ` · ${quand(p.annuleLe, lang)}` : ""}`],
                      [t("Motif", "Reason"), p.motifAnnulation ?? "—"],
                    ] as [string, string][])
                  : []),
              ]}
            />
          </Card>
          {!annule && (
            <Card className="h-fit">
              <CardHeader titre={t("Annuler ce paiement", "Cancel this payment")} sousTitre={t("Le paiement est conservé avec le motif ; les parents sont prévenus.", "The payment is kept with the reason; the parents are notified.")} />
              <Formulaire action={annulerPaiement.bind(null, p.eleveId, p.id)} libelle={t("Annuler le paiement", "Cancel payment")} variante="danger" confirmation={t("Annuler définitivement ce paiement ?", "Cancel this payment permanently?")}>
                <Field label={t("Motif", "Reason")}><Textarea name="motif" maxLength={500} required /></Field>
              </Formulaire>
            </Card>
          )}
        </div>
      </PageBody>
    </>
  );
}
