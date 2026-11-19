"use client";

import type { EtatFormulaire } from "@/lib/actions";
import { ActionForm } from "@/components/ui/action-form";
import { Field, Textarea } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { useT } from "@/lib/i18n/client";

/** CU-ECO-07 : demander l'annulation d'un paiement (motif obligatoire, validation par la direction). */
export function AnnulationForm({ action }: { action: (e: EtatFormulaire, fd: FormData) => Promise<EtatFormulaire> }) {
  const t = useT();
  return (
    <ActionForm action={action}>
      {() => (
        <>
          <Field label={t("Motif de l'annulation", "Cancellation reason")}>
            <Textarea name="motif" rows={3} placeholder={t("Ex. erreur de saisie du montant", "E.g. wrong amount entered")} />
          </Field>
          <SubmitButton variante="danger">{t("Envoyer la demande à la direction", "Send request to management")}</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}
