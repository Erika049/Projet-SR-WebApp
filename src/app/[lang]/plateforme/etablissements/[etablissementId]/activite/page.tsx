// Fonction sans équivalent dans le backend : retour à l'aperçu de l'établissement.
import { redirect } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ lang: string; etablissementId: string }> }) {
  const { lang, etablissementId } = await params;
  redirect(`/${lang}/plateforme/etablissements/${etablissementId}`);
}
