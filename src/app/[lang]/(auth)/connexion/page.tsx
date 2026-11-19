// Route : /[lang]/connexion — Connexion du personnel avec le compte du backend SchoolConnect.
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Connexion" };

export default async function ConnexionPage() {
  const t = await getT();
  return (
    <>
      <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">SchoolConnect</p>
      <h1 className="mt-1 text-2xl font-bold text-navy-800">{t("Connexion", "Sign in")}</h1>
      <p className="mt-4 text-3xl font-bold text-navy-800">{t("Bienvenue !", "Welcome!")}</p>
      <p className="mt-1 text-sm text-muted">{t("Gérez la scolarité, en toute simplicité.", "Manage school life, simply.")}</p>
      <div className="my-6" />
      <LoginForm />
      <p className="mt-6 text-center text-xs leading-relaxed text-muted">
        {t("Première connexion ? Contactez votre établissement.", "First time? Contact your school.")}
        <br />
        {t("Vos informations restent confidentielles.", "Your information stays confidential.")}
      </p>
    </>
  );
}
