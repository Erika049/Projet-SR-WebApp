// Route : /[lang]/comptabilite/paiements/nouveau?eleve= — Enregistrer un paiement avec reçu numérique (CU-ECO-02/03).
import { getLang, getT } from "@/lib/i18n/server";
import { aujourdhuiIso, fcfa } from "@/lib/format";
import { premier } from "@/lib/utils";
import { situation } from "@/lib/api/backend";
import { enregistrerPaiement } from "@/features/finances/actions";
import { RechercheEleve } from "@/features/finances/components/recherche-eleve";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, Details } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/form-field";
import { Formulaire } from "@/components/ui/formulaire";

export default async function NouveauPaiementPage({ searchParams }: PageProps<"/[lang]/comptabilite/paiements/nouveau">) {
  const [sp, t, lang] = await Promise.all([searchParams, getT(), getLang()]);
  const eleveId = premier(sp.eleve);
  const s = eleveId ? await situation(eleveId) : null;
  return (
    <>
      <PageHeader titre={t("Enregistrer un paiement", "Record a payment")} sousTitre={t("Le reçu est émis et les parents sont notifiés dans l'application mobile.", "The receipt is issued and the parents are notified in the mobile app.")} />
      <PageBody>
        {!s ? (
          <RechercheEleve q={premier(sp.q) ?? ""} lien={(id) => `/${lang}/comptabilite/paiements/nouveau?eleve=${id}`} />
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader titre={`${s.eleve.prenom} ${s.eleve.nom}`} />
              <Details
                lignes={[
                  [t("Total dû", "Total due"), fcfa(Number(s.totalDu), lang)],
                  [t("Déjà payé", "Already paid"), fcfa(Number(s.totalPaye), lang)],
                  [t("Reste à payer", "Balance"), <strong key="r" className="text-red-700">{fcfa(Math.max(0, Number(s.solde)), lang)}</strong>],
                ]}
              />
            </Card>
            <Card>
              <CardHeader titre={t("Paiement", "Payment")} />
              <Formulaire action={enregistrerPaiement.bind(null, s.eleveId)} libelle={t("Enregistrer et émettre le reçu", "Save and issue receipt")} reinitialiser={false}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label={t("Montant (FCFA)", "Amount (FCFA)")}><Input name="montant" inputMode="numeric" defaultValue={Number(s.solde) > 0 ? String(Number(s.solde)) : ""} required /></Field>
                  <Field label={t("Date", "Date")}><Input type="date" name="date" defaultValue={aujourdhuiIso()} required /></Field>
                  <Field label={t("Mode", "Method")}>
                    <Select name="mode" options={[{ value: "ESPECES", label: t("Espèces", "Cash") }, { value: "MOBILE_MONEY", label: "Mobile Money" }, { value: "VIREMENT", label: t("Virement", "Bank transfer") }, { value: "CHEQUE", label: t("Chèque", "Cheque") }]} />
                  </Field>
                  <Field label={t("Référence", "Reference")} aide={t("Obligatoire sauf en espèces.", "Required except for cash.")}><Input name="reference" /></Field>
                </div>
              </Formulaire>
            </Card>
          </div>
        )}
      </PageBody>
    </>
  );
}
