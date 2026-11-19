"use client";

import { changerMotDePasse, modifierProfil } from "@/features/auth/actions";
import { ActionForm } from "@/components/ui/action-form";
import { Field, Input, Select } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { useT } from "@/lib/i18n/client";

export function ProfilForm({ telephone, email, langue }: { telephone: string; email: string; langue: string }) {
  const t = useT();
  return (
    <ActionForm action={modifierProfil}>
      {() => (
        <>
          <Field label={t("Téléphone", "Phone")}><Input name="telephone" defaultValue={telephone} /></Field>
          <Field label={t("Courriel", "Email")}><Input type="email" name="email" defaultValue={email} /></Field>
          <Field label={t("Langue de l'interface", "Interface language")}>
            <Select name="langue" defaultValue={langue} options={[{ value: "fr", label: "Français" }, { value: "en", label: "English" }]} />
          </Field>
          <SubmitButton>{t("Enregistrer", "Save")}</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}

export function MotDePasseForm() {
  const t = useT();
  return (
    <ActionForm action={changerMotDePasse} reinitialiser>
      {() => (
        <>
          <Field label={t("Mot de passe actuel", "Current password")}><Input type="password" name="actuel" autoComplete="current-password" /></Field>
          <Field label={t("Nouveau mot de passe", "New password")} aide={t("8 caractères minimum.", "At least 8 characters.")}><Input type="password" name="motDePasse" autoComplete="new-password" /></Field>
          <Field label={t("Confirmer", "Confirm")}><Input type="password" name="confirmation" autoComplete="new-password" /></Field>
          <SubmitButton variante="secondaire">{t("Changer le mot de passe", "Change password")}</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}
