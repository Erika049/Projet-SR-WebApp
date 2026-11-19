import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(15,31,51,0.04)]", className)}>{children}</section>;
}

export function CardHeader({ titre, sousTitre, action }: { titre: React.ReactNode; sousTitre?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-bold text-ink">{titre}</h2>
        {sousTitre && <p className="mt-0.5 text-sm text-muted">{sousTitre}</p>}
      </div>
      {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}

/** Encadré d'information (règles de gestion affichées dans les maquettes). */
export function Note({ titre, children, ton = "navy" }: { titre?: string; children: React.ReactNode; ton?: "navy" | "alerte" }) {
  return (
    <div className={cn("rounded-xl p-4 text-sm", ton === "navy" ? "bg-navy-50 text-navy-800" : "bg-amber-50 text-amber-800")}>
      {titre && <p className="mb-1 font-semibold">{titre}</p>}
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}

/** Liste « libellé : valeur » des fiches. */
export function Details({ lignes }: { lignes: [React.ReactNode, React.ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2.5 text-sm">
      {lignes.map(([k, v], i) => (
        <div key={i} className="contents">
          <dt className="text-muted">{k}</dt>
          <dd className="font-medium text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
