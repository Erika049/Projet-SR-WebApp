"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { classesBouton, type Taille, type Variante } from "./button";

/** Bouton d'envoi qui se désactive pendant l'exécution de la Server Action. */
export function SubmitButton({
  children,
  variante = "primaire",
  taille = "md",
  className,
  name,
  value,
  confirmation,
}: {
  children: React.ReactNode;
  variante?: Variante;
  taille?: Taille;
  className?: string;
  name?: string;
  value?: string;
  /** Message de confirmation (window.confirm) avant l'envoi. */
  confirmation?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      onClick={(e) => {
        if (confirmation && !window.confirm(confirmation)) e.preventDefault();
      }}
      className={classesBouton(variante, taille, className)}
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
