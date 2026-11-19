"use client";
// Formulaire branché sur une Server Action : les champs sont fournis par la page (composant serveur),
// le retour du backend (succès, erreurs par champ, code généré) s'affiche au-dessus.
import { useActionState } from "react";
import { ETAT_INITIAL, type EtatFormulaire } from "@/lib/actions";
import { FormMessage } from "./form-message";
import { SubmitButton } from "./submit-button";
import type { Variante } from "./button";

export function Formulaire({
  action,
  libelle,
  children,
  variante = "primaire",
  confirmation,
  reinitialiser = true,
  className,
}: {
  action: (etat: EtatFormulaire, fd: FormData) => Promise<EtatFormulaire>;
  libelle: string;
  children: React.ReactNode;
  variante?: Variante;
  confirmation?: string;
  /** Vide le formulaire après un succès. */
  reinitialiser?: boolean;
  className?: string;
}) {
  const [etat, envoyer] = useActionState(action, ETAT_INITIAL);
  const erreurs = Object.values(etat.erreurs ?? {});
  return (
    <div className={className}>
      <div className="space-y-2">
        <FormMessage etat={etat} />
        {erreurs.length > 0 && (
          <ul className="list-inside list-disc text-xs text-red-600">
            {erreurs.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
        {etat.ok && etat.donnees?.code && (
          <p className="rounded-xl border-2 border-dashed border-brand-600 bg-brand-50 px-4 py-3 text-center font-mono text-2xl font-bold tracking-[0.3em] text-brand-700">
            {String(etat.donnees.code)}
          </p>
        )}
      </div>
      <form action={envoyer} className="mt-3 space-y-4" key={reinitialiser && etat.ok ? JSON.stringify(etat) : undefined}>
        {children}
        <SubmitButton variante={variante} confirmation={confirmation}>
          {libelle}
        </SubmitButton>
      </form>
    </div>
  );
}
