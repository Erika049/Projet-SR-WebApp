import Link from "next/link";
import { cn } from "@/lib/utils";

export type Variante = "primaire" | "secondaire" | "succes" | "danger" | "fantome" | "lien";
export type Taille = "sm" | "md";

const VARIANTES: Record<Variante, string> = {
  primaire: "bg-navy-700 text-white hover:bg-navy-800 shadow-sm",
  secondaire: "border border-line bg-white text-navy-700 hover:bg-navy-50",
  succes: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
  fantome: "text-navy-700 hover:bg-navy-50",
  lien: "text-navy-700 underline-offset-2 hover:underline px-0! py-0!",
};
const TAILLES: Record<Taille, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
};

export function classesBouton(variante: Variante = "primaire", taille: Taille = "md", extra?: string) {
  return cn(
    "inline-flex items-center justify-center rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap",
    VARIANTES[variante],
    TAILLES[taille],
    extra,
  );
}

type BoutonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante; taille?: Taille };

export function Button({ variante, taille, className, type = "button", ...props }: BoutonProps) {
  return <button type={type} className={classesBouton(variante, taille, className)} {...props} />;
}

type LienProps = React.ComponentProps<typeof Link> & { variante?: Variante; taille?: Taille };

export function ButtonLink({ variante, taille, className, ...props }: LienProps) {
  return <Link className={classesBouton(variante, taille, className)} {...props} />;
}
