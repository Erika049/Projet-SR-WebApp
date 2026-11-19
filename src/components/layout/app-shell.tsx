// Coquille commune des espaces connectés : menu latéral (avec les compteurs du backend) + contenu.
import { Suspense } from "react";
import type { Role } from "@/types/domain";
import { requireRole } from "@/lib/auth/dal";
import { ESPACE_PAR_ROLE } from "@/lib/auth/roles";
import { compteursMenu } from "@/lib/api/backend";
import type { CleBadge } from "@/config/navigation";
import { Sidebar } from "./sidebar";

async function Coquille({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const session = await requireRole(...roles);
  // Les compteurs ne doivent jamais empêcher l'affichage de l'espace (serveur momentanément indisponible).
  const badges = (await compteursMenu(session.role).catch(() => ({}))) as Partial<Record<CleBadge, number>>;
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar espace={ESPACE_PAR_ROLE[session.role]} badges={badges} />
      <main className="min-w-0 flex-1 pb-10">{children}</main>
    </div>
  );
}

function Chargement() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-64 border-r border-line bg-white lg:block" />
      <div className="flex-1 space-y-4 p-8">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-white" />
      </div>
    </div>
  );
}

/** Le contrôle de rôle lit la session : il est donc rendu à la requête, derrière un Suspense. */
export function AppShell({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  return (
    <Suspense fallback={<Chargement />}>
      <Coquille roles={roles}>{children}</Coquille>
    </Suspense>
  );
}
