"use client";

import type { EtatFormulaire } from "@/lib/actions";
import { ActionForm } from "@/components/ui/action-form";
import { Textarea } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { useT } from "@/lib/i18n/client";

export function ReponseForm({ action }: { action: (e: EtatFormulaire, fd: FormData) => Promise<EtatFormulaire> }) {
  const t = useT();
  return (
    <ActionForm action={action} reinitialiser>
      {() => (
        <>
          <Textarea name="texte" rows={3} placeholder={t("Votre réponse…", "Your reply…")} />
          <SubmitButton>{t("Envoyer la réponse", "Send reply")}</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}
