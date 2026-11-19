"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { connexion } from "@/features/auth/actions";
import { ETAT_INITIAL } from "@/lib/actions";
import { useLang, useT } from "@/lib/i18n/client";
import { LIBELLE_ROLE } from "@/lib/auth/roles";
import { Field, Input } from "@/components/ui/form-field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import type { Role } from "@/types/domain";

type CompteDemo = { email: string; role: Role; nom: string; motDePasse: string };

export function LoginForm({ comptesDemo }: { comptesDemo: CompteDemo[] }) {
  const [etat, action] = useActionState(connexion, ETAT_INITIAL);
  const [voir, setVoir] = useState(false);
  const [identifiant, setIdentifiant] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const t = useT();
  const lang = useLang();

  return (
    <>
      <form action={action} className="space-y-4">
        <FormMessage etat={etat} />
        <Field label={t("Identifiant ou téléphone", "Username or phone")}>
          <Input name="identifiant" autoComplete="username" placeholder="Ex. +237 6XX XXX XXX" value={identifiant} onChange={(e) => setIdentifiant(e.target.value)} required />
        </Field>
        <Field label={t("Mot de passe", "Password")}>
          <div className="relative">
            <Input name="motDePasse" type={voir ? "text" : "password"} autoComplete="current-password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} required className="pr-10" />
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

      {comptesDemo.length > 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-navy-200 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-600">{t("Comptes de démonstration", "Demo accounts")}</p>
          <p className="mt-1 text-xs text-muted">
            {t("Mot de passe", "Password")} : <code className="font-semibold text-ink">{comptesDemo[0].motDePasse}</code>
          </p>
          <ul className="mt-3 grid gap-1.5">
            {comptesDemo.map((c) => (
              <li key={c.email}>
                <button
                  type="button"
                  onClick={() => {
                    setIdentifiant(c.email);
                    setMotDePasse(c.motDePasse);
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-navy-50"
                >
                  <span className="font-semibold text-navy-800">{t(...LIBELLE_ROLE[c.role])}</span>
                  <span className="truncate text-xs text-muted">{c.email}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
