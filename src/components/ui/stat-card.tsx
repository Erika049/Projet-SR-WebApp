import { cn } from "@/lib/utils";

type Ton = "navy" | "succes" | "alerte" | "danger";
const TONS: Record<Ton, string> = {
  navy: "bg-navy-50 text-navy-700",
  succes: "bg-brand-50 text-brand-600",
  alerte: "bg-amber-50 text-amber-600",
  danger: "bg-red-50 text-red-600",
};

/** Tuile KPI : « Élèves inscrits · 1 248 · +12 ce mois ». */
export function StatCard({
  libelle,
  valeur,
  detail,
  icone,
  ton = "navy",
}: {
  libelle: string;
  valeur: React.ReactNode;
  detail?: React.ReactNode;
  icone?: React.ReactNode;
  ton?: Ton;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(15,31,51,0.04)]">
      <div className="flex items-center gap-3">
        {icone && <div className={cn("grid size-11 shrink-0 place-items-center rounded-xl", TONS[ton])}>{icone}</div>}
        <div className="min-w-0">
          <p className="truncate text-sm text-muted">{libelle}</p>
          <p className="text-2xl font-bold tracking-tight text-navy-800">{valeur}</p>
        </div>
      </div>
      {detail && <p className="mt-2 text-xs text-muted">{detail}</p>}
    </div>
  );
}

export function GrilleStats({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}
