"use client";
// Appel d'une classe (CU-SUR-02) : un bouton P / A / R par élève, brouillon conservé localement en cas de coupure réseau.
import { useActionState, useEffect, useState, useSyncExternalStore } from "react";
import { enregistrerAppel } from "@/features/presences/actions";
import { ETAT_INITIAL } from "@/lib/actions";
import { useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import type { StatutPresence } from "@/types/domain";
import { aujourdhuiIso } from "@/lib/format";

/** [notifie] : les parents ont déjà été prévenus de l'absence ou du retard. */
type Ligne = { id: string; nom: string; matricule: string; statut: StatutPresence; notifie?: boolean };

export function AppelForm({ classeId, lignes }: { classeId: string; lignes: Ligne[] }) {
  const t = useT();
  const cle = `appel-${classeId}-${aujourdhuiIso()}`;
  const [statuts, setStatuts] = useState<Record<string, StatutPresence>>(() => Object.fromEntries(lignes.map((l) => [l.id, l.statut])));
  const [etat, action] = useActionState(enregistrerAppel.bind(null, classeId), ETAT_INITIAL);

  // Sauvegarde locale de la saisie en cours (tolérance aux micro-coupures, exigence non fonctionnelle).
  const brouillon = useSyncExternalStore(
    () => () => {},
    () => {
      try {
        return localStorage.getItem(cle);
      } catch {
        return null;
      }
    },
    () => null,
  );
  const [modifie, setModifie] = useState(false);
  useEffect(() => {
    if (!modifie) return;
    try {
      if (etat.ok) localStorage.removeItem(cle);
      else localStorage.setItem(cle, JSON.stringify(statuts));
    } catch {}
  }, [statuts, etat.ok, cle, modifie]);
  const restaurer = () => {
    try {
      if (brouillon) setStatuts((s) => ({ ...s, ...JSON.parse(brouillon) }));
    } catch {}
  };
  const marquer = (id: string, v: StatutPresence) => {
    setModifie(true);
    setStatuts((s) => ({ ...s, [id]: v }));
  };

  const choix: [StatutPresence, string, string][] = [
    ["present", "P", "bg-brand-600 text-white"],
    ["absent", "A", "bg-red-600 text-white"],
    ["retard", "R", "bg-amber-500 text-white"],
  ];
  const compte = (s: StatutPresence) => Object.values(statuts).filter((v) => v === s).length;

  return (
    <form action={action} className="space-y-4">
      <FormMessage etat={etat} />
      {brouillon && !modifie && !etat.ok && (
        <p className="flex items-center justify-between gap-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {t("Une saisie non envoyée a été retrouvée sur cet appareil.", "An unsent entry was found on this device.")}
          <button type="button" onClick={restaurer} className="font-semibold underline">{t("Restaurer", "Restore")}</button>
        </p>
      )}
      <div className="flex flex-wrap gap-3 text-sm">
        <span className="rounded-lg bg-brand-50 px-3 py-1 font-semibold text-brand-700">{t("Présents", "Present")} : {compte("present")}</span>
        <span className="rounded-lg bg-red-50 px-3 py-1 font-semibold text-red-700">{t("Absents", "Absent")} : {compte("absent")}</span>
        <span className="rounded-lg bg-amber-50 px-3 py-1 font-semibold text-amber-700">{t("Retards", "Late")} : {compte("retard")}</span>
        <button type="button" onClick={() => {
            setModifie(true);
            setStatuts(Object.fromEntries(lignes.map((l) => [l.id, "present" as const])));
          }} className="ml-auto text-sm font-semibold text-navy-700 hover:underline">
          {t("Tous présents", "All present")}
        </button>
      </div>
      <ul className="divide-y divide-line rounded-xl border border-line">
        {lignes.map((l) => (
          <li key={l.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
            <div className="text-sm">
              <p className="font-semibold">{l.nom}</p>
              <p className="text-xs text-muted">
                {l.matricule}
                {l.statut !== "present" && statuts[l.id] === l.statut && (
                  <span className={l.notifie ? "ml-2 text-brand-700" : "ml-2 font-semibold text-amber-700"}>
                    {l.notifie ? t("· parents prévenus", "· parents notified") : t("· parents pas encore prévenus", "· parents not notified yet")}
                  </span>
                )}
              </p>
            </div>
            <input type="hidden" name={`statut_${l.id}`} value={statuts[l.id]} />
            <div className="flex gap-1.5">
              {choix.map(([v, lettre, actif]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => marquer(l.id, v)}
                  aria-pressed={statuts[l.id] === v}
                  className={cn("size-9 rounded-lg border text-sm font-bold transition", statuts[l.id] === v ? `${actif} border-transparent` : "border-line bg-white text-muted hover:bg-slate-50")}
                >
                  {lettre}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted">{t("Les parents des élèves absents ou en retard sont notifiés automatiquement.", "Parents of absent or late students are notified automatically.")}</p>
        <SubmitButton>{t("Enregistrer l'appel", "Save roll call")}</SubmitButton>
      </div>
    </form>
  );
}
