// Courbe SVG avec aire (présence sur 7 jours).
export type Point = { libelle: string; valeur: number };

export function LineChart({ donnees, min, max, hauteur = 200, suffixe = "" }: { donnees: Point[]; min: number; max: number; hauteur?: number; suffixe?: string }) {
  const L = 600;
  const H = 200;
  const x = (i: number) => (donnees.length <= 1 ? L / 2 : (i / (donnees.length - 1)) * (L - 20) + 10);
  const y = (v: number) => H - ((Math.min(max, Math.max(min, v)) - min) / (max - min)) * (H - 20) - 10;
  const ligne = donnees.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.valeur)}`).join(" ");
  const aire = `${ligne} L${x(donnees.length - 1)},${H} L${x(0)},${H} Z`;
  const graduations = [0, 0.25, 0.5, 0.75, 1].map((g) => Math.round(min + g * (max - min)));
  return (
    <div className="flex gap-2" style={{ height: hauteur }}>
      <div className="flex flex-col-reverse justify-between pb-6 text-right text-[10px] text-muted">
        {graduations.map((g) => (
          <span key={g}>{g}</span>
        ))}
      </div>
      <div className="flex flex-1 flex-col">
        <svg viewBox={`0 0 ${L} ${H}`} preserveAspectRatio="none" className="w-full flex-1 overflow-visible">
          {graduations.map((g) => (
            <line key={g} x1={0} x2={L} y1={y(g)} y2={y(g)} stroke="var(--color-line)" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
          ))}
          <path d={aire} fill="var(--color-brand-50)" />
          <path d={ligne} fill="none" stroke="var(--color-brand-600)" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="relative mt-1 h-5">
          {donnees.map((d, i) => (
            <span key={d.libelle} className="absolute -translate-x-1/2 text-xs text-muted" style={{ left: `${(x(i) / L) * 100}%` }} title={`${d.valeur}${suffixe}`}>
              {d.libelle}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
