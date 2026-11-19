// Route : /[lang]/invitation/[token] — Pas d'invitation par lien dans le backend SchoolConnect :
// le compte du personnel est créé par la direction avec un mot de passe initial (Personnel → Ajouter).
import Link from "next/link";
import { getLang, getT } from "@/lib/i18n/server";

export default async function InvitationPage() {
  const [t, lang] = await Promise.all([getT(), getLang()]);
  return (
    <>
      <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">SchoolConnect</p>
      <h1 className="mt-1 text-2xl font-bold text-navy-800">{t("Activer mon compte", "Activate my account")}</h1>
      <p className="mb-6 mt-2 text-sm text-muted">
        {t(
          "Les invitations par lien ne sont pas encore disponibles. Votre compte est créé par la direction avec un mot de passe initial : connectez-vous avec votre téléphone, puis changez-le dans « Mon compte ».",
          "Invitation links are not available yet. Your account is created by management with an initial password: sign in with your phone, then change it in “My account”.",
        )}
      </p>
      <Link href={`/${lang}/connexion`} className="block rounded-lg bg-navy-700 py-3 text-center text-sm font-semibold text-white">
        {t("Se connecter", "Sign in")}
      </Link>
    </>
  );
}
