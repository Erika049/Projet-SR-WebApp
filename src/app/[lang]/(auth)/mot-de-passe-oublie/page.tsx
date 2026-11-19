// Route : /[lang]/mot-de-passe-oublie — code envoyé par SMS, puis nouveau mot de passe (backend SchoolConnect).
import { getT } from "@/lib/i18n/server";
import { ForgotPasswordForm } from "@/features/auth/components/simple-forms";

export default async function MotDePasseOubliePage() {
  const t = await getT();
  return (
    <>
      <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">SchoolConnect</p>
      <h1 className="mt-1 text-2xl font-bold text-navy-800">{t("Mot de passe oublié", "Forgot password")}</h1>
      <p className="mb-6 mt-2 text-sm text-muted">
        {t("Indiquez votre adresse e-mail : vous recevrez un code pour choisir un nouveau mot de passe.", "Enter your email: you will receive a code to choose a new password.")}
      </p>
      <ForgotPasswordForm />
    </>
  );
}
