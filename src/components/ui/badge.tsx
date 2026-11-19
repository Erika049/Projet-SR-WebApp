import { cn } from "@/lib/utils";

export type Ton = "neutre" | "succes" | "alerte" | "danger" | "info" | "navy";

const TONS: Record<Ton, string> = {
  neutre: "bg-slate-100 text-slate-700",
  succes: "bg-brand-50 text-brand-700",
  alerte: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  info: "bg-sky-50 text-sky-700",
  navy: "bg-navy-50 text-navy-700",
};

export function Badge({ ton = "neutre", children, className }: { ton?: Ton; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-semibold", TONS[ton], className)}>
      {children}
    </span>
  );
}

/** Petit compteur rond (menu latéral, listes « À traiter »). */
export function Compteur({ valeur, ton = "alerte" }: { valeur: number; ton?: Ton }) {
  return (
    <span className={cn("inline-flex min-w-6 items-center justify-center rounded-md px-1.5 py-0.5 text-xs font-bold", TONS[ton])}>
      {valeur}
    </span>
  );
}
