import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Indicateur d'étapes des assistants : « 1 Établissement 2 Directeur 3 Abonnement 4 Confirmation ». */
export function Stepper({ etapes, courante }: { etapes: string[]; courante: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 text-sm">
      {etapes.map((e, i) => {
        const n = i + 1;
        const fait = n < courante;
        const actif = n === courante;
        return (
          <li key={e} className="flex items-center gap-2">
            {i > 0 && <span className="h-px w-6 bg-line" />}
            <span
              className={cn(
                "grid size-6 place-items-center rounded-full text-xs font-bold",
                fait ? "bg-brand-600 text-white" : actif ? "bg-navy-700 text-white" : "bg-slate-100 text-muted",
              )}
            >
              {fait ? <Check className="size-3.5" /> : n}
            </span>
            <span className={cn("font-semibold", actif ? "text-navy-800" : "text-muted")}>{e}</span>
          </li>
        );
      })}
    </ol>
  );
}
