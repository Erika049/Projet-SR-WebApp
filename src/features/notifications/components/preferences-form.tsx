"use client";

import { enregistrerPreferences } from "@/features/notifications/actions";
import { ActionForm } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { useT } from "@/lib/i18n/client";

type Preference = { type: string; libelle: [string, string]; critique?: boolean; actif: boolean };

export function PreferencesForm({ preferences }: { preferences: Preference[] }) {
  const t = useT();
  return (
    <ActionForm action={enregistrerPreferences}>
      {() => (
        <>
          <ul className="space-y-3">
            {preferences.map((p) => (
              <li key={p.type}>
                <label className="flex items-center justify-between gap-3 text-sm">
                  <span>{t(...p.libelle)}</span>
                  <input type="checkbox" name="type" value={p.type} defaultChecked={p.actif} disabled={p.critique} className="size-4 accent-brand-600" />
                </label>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted">{t("Les notifications critiques ne peuvent pas être désactivées.", "Critical notifications cannot be turned off.")}</p>
          <SubmitButton variante="secondaire" taille="sm">
            {t("Enregistrer", "Save")}
          </SubmitButton>
        </>
      )}
    </ActionForm>
  );
}
