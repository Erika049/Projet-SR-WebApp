// Anneau SVG (répartition des plans, modes de paiement).
export type Part = { libelle: string; valeur: number; couleur: string };

export function DonutChart({ parts, centre, format = (v) => String(v) }: { parts: Part[]; centre?: React.ReactNode; format?: (v: number) => string }) {
  const total = parts.reduce((s, p) => s + p.valeur, 0) || 1;
  const r = 40;
  const c = 2 * Math.PI * r;
  const longueurs = parts.map((p) => (p.valeur / total) * c);
  const decalages = longueurs.map((_, i) => longueurs.slice(0, i).reduce((s, l) => s + l, 0));
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative size-36 shrink-0">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          <circle cx={50} cy={50} r={r} fill="none" stroke="var(--color-line)" strokeWidth={14} />
          {parts.map((p, i) => (
            <circle
              key={p.libelle}
              cx={50}
              cy={50}
              r={r}
              fill="none"
              stroke={p.couleur}
              strokeWidth={14}
              strokeDasharray={`${longueurs[i]} ${c - longueurs[i]}`}
              strokeDashoffset={-decalages[i]}
            />
          ))}
        </svg>
        {centre && <div className="absolute inset-0 grid place-items-center text-xl font-bold text-navy-800">{centre}</div>}
      </div>
      <ul className="min-w-36 flex-1 space-y-2 text-sm">
        {parts.map((p) => (
          <li key={p.libelle} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-full" style={{ background: p.couleur }} />
              {p.libelle}
            </span>
            <span className="font-semibold text-ink">{format(p.valeur)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
