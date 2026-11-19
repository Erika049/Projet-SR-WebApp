"use client";
// CU-SUR-05 : appel du personnel du jour (P = présent, A = absent, R = retard).
import { useState } from "react";
import { saisirPresencePersonnel } from "@/features/assiduite-personnel/actions";
import { ActionForm } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import type { PresencePersonnel } from "@/types/domain";

type Ligne = { id: string; nom: string; fonction: string; presence: PresencePersonnel | null; conge: boolean };

export function AppelPersonnelForm({ lignes }: { lignes: Ligne[] }) {
  const t = useT();
  const [valeurs, setValeurs] = useState<Record<string, PresencePersonnel | null>>(() => Object.fromEntries(lignes.map((l) => [l.id, l.presence])));
  const styles: Record<PresencePersonnel, string> = { P: "bg-brand-600 text-white", A: "bg-red-600 text-white", R: "bg-amber-500 text-white" };
  return (
    <ActionForm action={saisirPresencePersonnel}>
      {() => (
        <>
          <ul className="divide-y divide-line">
            {lignes.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="text-sm">
                  <p className="font-semibold">{l.nom}</p>
                  <p className="text-xs text-muted">{l.fonction}</p>
                </div>
                {l.conge ? (
                  <span className="rounded-md bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700">{t("En congé", "On leave")}</span>
                ) : (
                  <div className="flex gap-1.5">
                    {valeurs[l.id] && <input type="hidden" name={`p_${l.id}`} value={valeurs[l.id]!} />}
                    {(["P", "A", "R"] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        aria-pressed={valeurs[l.id] === v}
                        onClick={() => setValeurs((s) => ({ ...s, [l.id]: v }))}
                        className={cn("size-9 rounded-lg border text-sm font-bold", valeurs[l.id] === v ? `${styles[v]} border-transparent` : "border-line bg-white text-muted hover:bg-slate-50")}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
          <SubmitButton>{t("Enregistrer l'appel du personnel", "Save staff roll call")}</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}
