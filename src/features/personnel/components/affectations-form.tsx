"use client";

import type { EtatFormulaire } from "@/lib/actions";
import { ActionForm } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { useT } from "@/lib/i18n/client";

/** Modifier les affectations d'un enseignant : une ligne par classe, avec ses heures hebdomadaires. */
export function AffectationsForm({
  action,
  classes,
  heures,
  matiere,
}: {
  action: (e: EtatFormulaire, fd: FormData) => Promise<EtatFormulaire>;
  classes: { id: string; libelle: string }[];
  heures: Record<string, number>;
  matiere: string;
}) {
  const t = useT();
  return (
    <ActionForm action={action}>
      {() => (
        <>
          <input type="hidden" name="matiere" value={matiere} />
          <p className="text-sm text-muted">{t("Indiquez 0 heure pour retirer une classe.", "Enter 0 hours to remove a class.")}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {classes.map((c) => (
              <label key={c.id} className="flex items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-sm">
                <span className="font-medium">{c.libelle}</span>
                <input type="hidden" name="classeId" value={c.id} />
                <input type="number" name="heures" min={0} max={12} defaultValue={heures[c.id] ?? 0} className="input w-16 px-2 py-1 text-right" />
              </label>
            ))}
          </div>
          <SubmitButton>{t("Enregistrer les affectations", "Save assignments")}</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}
