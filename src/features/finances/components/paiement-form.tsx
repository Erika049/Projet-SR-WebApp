"use client";
// CU-ECO-02 / CU-ECO-03 : enregistrer un paiement et émettre le reçu numérique (aperçu en direct).
import { useActionState, useState } from "react";
import { enregistrerPaiement } from "@/features/finances/actions";
import { ETAT_INITIAL } from "@/lib/actions";
import { useLang, useT } from "@/lib/i18n/client";
import { fcfa } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/form-field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";

export function PaiementForm({ eleve, etablissement }: { eleve: { id: string; nom: string; classe: string; solde: number; suggestion: number }; etablissement: string }) {
  const t = useT();
  const lang = useLang();
  const [etat, action] = useActionState(enregistrerPaiement, ETAT_INITIAL);
  const [montant, setMontant] = useState(eleve.suggestion);
  const [mode, setMode] = useState("especes");
  const modes = [
    { value: "especes", label: t("Espèces", "Cash") },
    { value: "mtn_momo", label: "MTN MoMo" },
    { value: "orange_money", label: "Orange Money" },
    { value: "virement", label: t("Virement", "Bank transfer") },
  ];
  const e = etat.erreurs ?? {};

  return (
    <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
      <form action={action}>
        <Card className="space-y-4">
          <CardHeader titre={t("Paiement", "Payment")} />
          <FormMessage etat={etat} />
          <input type="hidden" name="eleveId" value={eleve.id} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("Montant (FCFA)", "Amount (FCFA)")} erreur={e.montant} aide={t(`Solde restant : ${fcfa(eleve.solde, lang)}`, `Remaining balance: ${fcfa(eleve.solde, lang)}`)}>
              <Input type="number" name="montant" min={1} max={eleve.solde} step={500} value={montant} onChange={(ev) => setMontant(Number(ev.target.value))} />
            </Field>
            <Field label={t("Mode de paiement", "Payment method")}>
              <Select name="mode" value={mode} onChange={(ev) => setMode(ev.target.value)} options={modes} />
            </Field>
            {mode !== "especes" && (
              <Field label={t("Référence de transaction", "Transaction reference")} erreur={e.reference} className="sm:col-span-2">
                <Input name="reference" placeholder={mode === "virement" ? "VIR-2026-…" : "MP2611…"} />
              </Field>
            )}
          </div>
          <SubmitButton variante="succes">{t("Enregistrer et émettre le reçu", "Save and issue receipt")}</SubmitButton>
        </Card>
      </form>
      <Card className="h-fit">
        <CardHeader titre={t("Aperçu du reçu", "Receipt preview")} />
        <div className="space-y-2 rounded-xl border border-dashed border-line p-4 text-sm">
          <p className="text-center font-bold text-navy-800">{etablissement}</p>
          <dl className="space-y-1.5">
            <div className="flex justify-between"><dt className="text-muted">{t("Élève", "Student")}</dt><dd className="font-semibold">{eleve.nom} · {eleve.classe}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">{t("Montant", "Amount")}</dt><dd className="font-semibold">{fcfa(montant || 0, lang)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">{t("Mode", "Method")}</dt><dd>{modes.find((m) => m.value === mode)?.label}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">{t("Solde après paiement", "Balance after payment")}</dt><dd className="font-semibold">{fcfa(Math.max(0, eleve.solde - (montant || 0)), lang)}</dd></div>
          </dl>
          <p className="pt-2 text-center text-xs text-muted">{t("Merci de votre confiance.", "Thank you for your trust.")}</p>
        </div>
        <p className="mt-3 text-xs text-muted">{t("Le parent reçoit le reçu dans l'application mobile.", "The parent receives the receipt in the mobile app.")}</p>
      </Card>
    </div>
  );
}
