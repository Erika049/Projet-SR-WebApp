// Route : /[lang]/invitation/[token] — le lien d'invitation (directeur, personnel) permet de choisir son mot de passe.
import { Suspense } from "react";
import { getT } from "@/lib/i18n/server";
import { InvitationForm } from "@/features/auth/components/simple-forms";

async function Formulaire({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <InvitationForm token={token} />;
}

export default async function InvitationPage({ params }: PageProps<"/[lang]/invitation/[token]">) {
  const t = await getT();
  return (
    <>
      <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">SchoolConnect</p>
      <h1 className="mt-1 text-2xl font-bold text-navy-800">{t("Activer mon compte", "Activate my account")}</h1>
      <p className="mb-6 mt-2 text-sm text-muted">
        {t("Choisissez votre mot de passe. Personne d'autre, pas même la direction, ne pourra le voir.", "Choose your password. Nobody else, not even management, will be able to see it.")}
      </p>
      <Suspense>
        <Formulaire params={params} />
      </Suspense>
    </>
  );
}
