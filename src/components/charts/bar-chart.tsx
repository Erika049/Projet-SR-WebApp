// Histogramme SVG léger (aucune bibliothèque : adapté aux connexions lentes).
export type Barre = { libelle: string; valeur: number; accent?: boolean };

export function BarChart({ donnees, format = (v) => String(v), hauteur = 200 }: { donnees: Barre[]; format?: (v: number) => string; hauteur?: number }) {
  const max = Math.max(1, ...donnees.map((d) => d.valeur)) * 1.15;
  const largeur = 100 / Math.max(1, donnees.length);
  const graduations = [0, 0.25, 0.5, 0.75, 1].map((g) => g * max);
  return (
    <div className="flex gap-2" style={{ height: hauteur }}>
      <div className="flex flex-col-reverse justify-between pb-6 text-right text-[10px] text-muted">
        {graduations.map((g, i) => (
          <span key={i}>{format(Math.round(g))}</span>
        ))}
      </div>
      <div className="relative flex-1">
        <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col-reverse justify-between">
          {graduations.map((_, i) => (
            <div key={i} className="border-t border-dashed border-line" />
          ))}
        </div>
        <div className="absolute inset-x-0 top-0 bottom-6 flex items-end">
          {donnees.map((d) => (
            <div key={d.libelle} className="flex h-full flex-col items-center justify-end px-[12%]" style={{ width: `${largeur}%` }}>
              <span className="mb-1 text-xs font-bold text-navy-800">{format(d.valeur)}</span>
              <div
                className={`w-full max-w-20 rounded-t-md ${d.accent ? "bg-brand-600" : "bg-navy-700"}`}
                style={{ height: `${(d.valeur / max) * 100}%`, minHeight: d.valeur > 0 ? 2 : 0 }}
                title={`${d.libelle} : ${format(d.valeur)}`}
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 flex">
          {donnees.map((d) => (
            <span key={d.libelle} className="truncate text-center text-xs text-muted" style={{ width: `${largeur}%` }}>
              {d.libelle}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
