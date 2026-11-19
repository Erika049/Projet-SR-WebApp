"use client";
// Formulaires publics : mot de passe oublié, activation d'invitation.
import Link from "next/link";
import { useActionState } from "react";
import { activerInvitation, motDePasseOublie } from "@/features/auth/actions";
import { ETAT_INITIAL } from "@/lib/actions";
import { useLang, useT } from "@/lib/i18n/client";
import { Field, Input } from "@/components/ui/form-field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";

export function ForgotPasswordForm() {
  const [etat, action] = useActionState(motDePasseOublie, ETAT_INITIAL);
  const t = useT();
  const lang = useLang();
  return (
    <form action={action} className="space-y-4">
      <FormMessage etat={etat} />
      <Field label={t("Courriel ou téléphone", "Email or phone")}>
        <Input name="identifiant" placeholder="+237 6XX XXX XXX" required />
      </Field>
      <SubmitButton className="w-full py-3">{t("Recevoir un code", "Send me a code")}</SubmitButton>
      <Link href={`/${lang}/connexion`} className="block text-center text-sm font-semibold text-navy-700 hover:underline">
        {t("Retour à la connexion", "Back to sign in")}
      </Link>
    </form>
  );
}

export function InvitationForm({ token }: { token: string }) {
  const [etat, action] = useActionState(activerInvitation.bind(null, token), ETAT_INITIAL);
  const t = useT();
  const lang = useLang();
  if (etat.ok)
    return (
      <div className="space-y-4">
        <FormMessage etat={etat} />
        <Link href={`/${lang}/connexion`} className="block rounded-lg bg-navy-700 py-3 text-center text-sm font-semibold text-white">
          {t("Se connecter", "Sign in")}
        </Link>
      </div>
    );
  return (
    <form action={action} className="space-y-4">
      <FormMessage etat={etat} />
      <Field label={t("Nouveau mot de passe", "New password")} aide={t("8 caractères minimum.", "At least 8 characters.")}>
        <Input name="motDePasse" type="password" autoComplete="new-password" required minLength={8} />
      </Field>
      <Field label={t("Confirmer le mot de passe", "Confirm password")}>
        <Input name="confirmation" type="password" autoComplete="new-password" required />
      </Field>
      <SubmitButton className="w-full py-3">{t("Activer mon compte", "Activate my account")}</SubmitButton>
    </form>
  );
}
