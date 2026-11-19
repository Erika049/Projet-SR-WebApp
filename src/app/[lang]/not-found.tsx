import Link from "next/link";
import { getLang, getT } from "@/lib/i18n/server";

export default async function NotFound() {
  const [t, lang] = await Promise.all([getT(), getLang()]);
  return (
    <div className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-brand-600">404</p>
        <h1 className="mt-2 text-2xl font-bold text-navy-800">{t("Page introuvable", "Page not found")}</h1>
        <p className="mt-2 text-muted">{t("Cette page n'existe pas ou a été déplacée.", "This page does not exist or has moved.")}</p>
        <Link href={`/${lang}`} className="mt-6 inline-block rounded-lg bg-navy-700 px-4 py-2 text-sm font-semibold text-white">
          {t("Retour à l'accueil", "Back to home")}
        </Link>
      </div>
    </div>
  );
}
