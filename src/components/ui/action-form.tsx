"use client";

import { useActionState } from "react";
import { ETAT_INITIAL, type EtatFormulaire } from "@/lib/actions";
import { FormMessage } from "./form-message";

/**
 * Formulaire générique branché sur une Server Action renvoyant un EtatFormulaire.
 * Le contenu reçoit l'état (erreurs par champ) pour afficher les messages au bon endroit.
 */
export function ActionForm({
  action,
  children,
  className,
  reinitialiser = false,
}: {
  action: (etat: EtatFormulaire, fd: FormData) => Promise<EtatFormulaire>;
  children: (etat: EtatFormulaire) => React.ReactNode;
  className?: string;
  /** Vide le formulaire après un succès. */
  reinitialiser?: boolean;
}) {
  const [etat, envoyer] = useActionState(action, ETAT_INITIAL);
  return (
    <form action={envoyer} className={className} key={reinitialiser && etat.ok ? JSON.stringify(etat) : undefined}>
      <div className="space-y-4">
        <FormMessage etat={etat} />
        {children(etat)}
      </div>
    </form>
  );
}
