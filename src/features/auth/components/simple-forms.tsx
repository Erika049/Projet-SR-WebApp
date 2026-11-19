"use client";
// Mot de passe oublié en trois étapes : identifiant → code reçu par SMS → nouveau mot de passe.
import Link from "next/link";
import { useActionState } from "react";
import { motDePasseOublie } from "@/features/auth/actions";
import { ETAT_INITIAL } from "@/lib/actions";
import { useLang, useT } from "@/lib/i18n/client";
import { Field, Input } from "@/components/ui/form-field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";

export function ForgotPasswordForm() {
  const [etat, action] = useActionState(motDePasseOublie, ETAT_INITIAL);
  const t = useT();
  const lang = useLang();
  const etape = String(etat.donnees?.etape ?? "demande");
  const retour = (
    <Link href={`/${lang}/connexion`} className="block text-center text-sm font-semibold text-navy-700 hover:underline">
      {t("Retour à la connexion", "Back to sign in")}
    </Link>
  );

  if (etape === "fini") {
    return (
      <div className="space-y-4">
        <FormMessage etat={etat} />
        <Link href={`/${lang}/connexion`} className="block rounded-lg bg-navy-700 py-3 text-center text-sm font-semibold text-white">
          {t("Se connecter", "Sign in")}
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4" key={etape}>
      <FormMessage etat={etat} />
      <input type="hidden" name="etape" value={etape} />
      {etape === "demande" && (
        <>
          <Field label={t("Adresse e-mail", "Email address")}>
            <Input name="identifiant" type="email" placeholder="prenom.nom@etablissement.cm" autoComplete="email" required />
          </Field>
          <SubmitButton className="w-full py-3">{t("Recevoir un code", "Send me a code")}</SubmitButton>
        </>
      )}
      {etape === "code" && (
        <>
          <input type="hidden" name="identifiant" value={String(etat.donnees?.identifiant ?? "")} />
          <Field label={t("Code reçu", "Code received")} aide={t("6 chiffres, valable 10 minutes.", "6 digits, valid for 10 minutes.")}>
            <Input name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required />
          </Field>
          <SubmitButton className="w-full py-3">{t("Vérifier le code", "Verify the code")}</SubmitButton>
        </>
      )}
      {etape === "nouveau" && (
        <>
          <input type="hidden" name="jeton" value={String(etat.donnees?.jeton ?? "")} />
          <Field label={t("Nouveau mot de passe", "New password")} aide={t("8 caractères minimum.", "At least 8 characters.")}>
            <Input name="motDePasse" type="password" autoComplete="new-password" required minLength={8} />
          </Field>
          <Field label={t("Confirmer le mot de passe", "Confirm password")}>
            <Input name="confirmation" type="password" autoComplete="new-password" required />
          </Field>
          <SubmitButton className="w-full py-3">{t("Enregistrer", "Save")}</SubmitButton>
        </>
      )}
      {retour}
    </form>
  );
}
