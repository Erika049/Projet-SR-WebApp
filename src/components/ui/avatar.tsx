import { cn, initiales } from "@/lib/utils";

export function Avatar({ nom, taille = "sm", className }: { nom: string; taille?: "sm" | "md" | "lg"; className?: string }) {
  const t = { sm: "size-8 text-[11px]", md: "size-10 text-sm", lg: "size-14 text-lg" }[taille];
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-full bg-navy-50 font-bold text-navy-700", t, className)}>
      {initiales(nom)}
    </span>
  );
}

/** Avatar + nom (+ sous-titre) pour les cellules de tableau. */
export function Personne({ nom, detail }: { nom: string; detail?: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2.5">
      <Avatar nom={nom} />
      <span className="min-w-0">
        <span className="block font-semibold text-ink">{nom}</span>
        {detail && <span className="block text-xs text-muted">{detail}</span>}
      </span>
    </span>
  );
}
