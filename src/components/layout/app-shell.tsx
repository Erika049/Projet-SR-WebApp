// Coquille commune des espaces connectés : menu latéral + contenu + mention « Données d'exemple ».
import { Suspense } from "react";
import type { Role } from "@/types/domain";
import { requireRole } from "@/lib/auth/dal";
import { ESPACE_PAR_ROLE } from "@/lib/auth/roles";
import { USE_MOCK } from "@/lib/api/client";
import { getT } from "@/lib/i18n/server";
import { compteursMenu } from "@/features/tableaux-de-bord/queries";
import { Sidebar } from "./sidebar";

async function Coquille({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const session = await requireRole(...roles);
  const [badges, t] = await Promise.all([compteursMenu(session.role), getT()]);
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar espace={ESPACE_PAR_ROLE[session.role]} badges={badges} />
      <main className="min-w-0 flex-1 pb-10">
        {children}
        {USE_MOCK && <p className="px-8 text-right text-xs text-muted">{t("Données d'exemple", "Sample data")}</p>}
      </main>
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
