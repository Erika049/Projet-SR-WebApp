import { CheckCircle2, AlertCircle } from "lucide-react";
import type { EtatFormulaire } from "@/lib/actions";

/** Message de retour d'une Server Action (succès ou erreur). */
export function FormMessage({ etat }: { etat: EtatFormulaire }) {
  if (!etat.message) return null;
  const ok = etat.ok;
  return (
    <p
      role={ok ? "status" : "alert"}
      className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm font-medium ${ok ? "bg-brand-50 text-brand-700" : "bg-red-50 text-red-700"}`}
    >
      {ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <AlertCircle className="mt-0.5 size-4 shrink-0" />}
      {etat.message}
    </p>
  );
}
