// Route : /[lang] — redirige vers l'espace du rôle connecté, sinon vers la connexion.
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { accueilDuRole } from "@/lib/auth/roles";

async function Redirection({ params }: { params: Promise<{ lang: string }> }) {
  const [{ lang }, session] = await Promise.all([params, getSession()]);
  redirect(session ? accueilDuRole(session.role, lang) : `/${lang}/connexion`);
  return null;
}

export default function Home({ params }: PageProps<"/[lang]">) {
  return (
    <Suspense>
      <Redirection params={params} />
    </Suspense>
  );
}
