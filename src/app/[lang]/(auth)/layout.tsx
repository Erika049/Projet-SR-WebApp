// Mise en page des écrans publics : panneau SchoolConnect à gauche, formulaire à droite (maquette « Connexion »).
import { Logo } from "@/components/ui/logo";
import { getT } from "@/lib/i18n/server";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getT();
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,44%)_1fr]">
      <aside className="relative hidden flex-col items-center justify-center bg-navy-700 px-10 text-center text-white lg:flex">
        <span className="grid place-items-center rounded-3xl bg-white px-6 py-5 shadow-lg">
          <Logo taille={96} />
        </span>
        <p className="mt-8 text-4xl font-bold tracking-tight">SchoolConnect</p>
        <p className="mt-4 text-lg text-white/90">L&apos;école, plus proche de vous.</p>
        <span className="mt-6 h-1 w-14 rounded-full bg-brand-400" />
        <div className="absolute bottom-8 text-center">
          <p className="text-xs font-bold tracking-widest text-white/90">
            {t("DIRECTION · SECRÉTARIAT · SURVEILLANCE · COMPTABILITÉ", "MANAGEMENT · SECRETARIAT · DISCIPLINE · ACCOUNTING")}
          </p>
          <p className="mt-2 text-xs text-white/60">{t("Pensé pour les écoles du Cameroun", "Designed for Cameroonian schools")}</p>
        </div>
      </aside>
      <main className="flex items-center justify-center bg-surface px-5 py-10">
        <div className="w-full max-w-md">
          {/* Sur mobile, le panneau de gauche est masqué : on affiche le logo au-dessus du formulaire. */}
          <Logo taille={48} avecNom className="mb-6 lg:hidden" />
          {children}
        </div>
      </main>
    </div>
  );
}
