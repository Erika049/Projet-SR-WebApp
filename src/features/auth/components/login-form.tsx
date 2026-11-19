"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { connexion } from "@/features/auth/actions";
import { ETAT_INITIAL } from "@/lib/actions";
import { useLang, useT } from "@/lib/i18n/client";
import { Field, Input } from "@/components/ui/form-field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";

export function LoginForm() {
  const [etat, action] = useActionState(connexion, ETAT_INITIAL);
  const [voir, setVoir] = useState(false);
  const t = useT();
  const lang = useLang();

  return (
    <form action={action} className="space-y-4">
      <FormMessage etat={etat} />
      <Field label={t("Adresse e-mail", "Email address")}>
        <Input name="identifiant" type="email" autoComplete="email" placeholder="prenom.nom@etablissement.cm" required />
      </Field>
      <Field label={t("Mot de passe", "Password")}>
        <div className="relative">
          <Input name="motDePasse" type={voir ? "text" : "password"} autoComplete="current-password" required className="pr-10" />
          <button type="button" onClick={() => setVoir(!voir)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:text-navy-700" aria-label={t("Afficher le mot de passe", "Show password")}>
            {voir ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>
      <div className="text-right">
        <Link href={`/${lang}/mot-de-passe-oublie`} className="text-sm font-semibold text-navy-700 hover:underline">
          {t("Mot de passe oublié ?", "Forgot password?")}
        </Link>
      </div>
      <SubmitButton className="w-full py-3">{t("Se connecter", "Sign in")}</SubmitButton>
    </form>
  );
}
