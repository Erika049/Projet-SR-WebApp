"use client";
// CU-SUR-04 : enregistrer un retard ou une sortie anticipée. Le parent est notifié automatiquement.
import { useState } from "react";
import { enregistrerRetardSortie } from "@/features/presences/actions";
import { ActionForm } from "@/components/ui/action-form";
import { Field, Input, Select } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

export function RetardForm({ classes, eleves }: { classes: { id: string; libelle: string }[]; eleves: { id: string; nom: string; classeId: string }[] }) {
  const t = useT();
  const [classeId, setClasseId] = useState(classes[0]?.id ?? "");
  const [type, setType] = useState<"retard" | "sortie">("retard");
  const maintenant = new Date().toTimeString().slice(0, 5);
  return (
    <ActionForm action={enregistrerRetardSortie} reinitialiser>
      {(etat) => (
        <>
          <div className="flex rounded-xl bg-slate-100 p-1">
            {(["retard", "sortie"] as const).map((v) => (
              <label key={v} className={cn("flex-1 cursor-pointer rounded-lg py-1.5 text-center text-sm font-semibold", type === v ? "bg-white text-navy-800 shadow-sm" : "text-muted")}>
                <input type="radio" name="type" value={v} checked={type === v} onChange={() => setType(v)} className="sr-only" />
                {v === "retard" ? t("Retard", "Late") : t("Sortie anticipée", "Early exit")}
              </label>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("Classe", "Class")}>
              <Select value={classeId} onChange={(e) => setClasseId(e.target.value)} options={classes.map((c) => ({ value: c.id, label: c.libelle }))} />
            </Field>
            <Field label={t("Heure", "Time")} erreur={etat.erreurs?.heure}>
              <Input type="time" name="heure" defaultValue={maintenant} />
            </Field>
          </div>
          <Field label={t("Élève", "Student")} erreur={etat.erreurs?.eleveId}>
            <Select name="eleveId" vide={t("Choisir…", "Choose…")} options={eleves.filter((e) => e.classeId === classeId).map((e) => ({ value: e.id, label: e.nom }))} />
          </Field>
          <Field label={t("Motif", "Reason")}>
            <Input name="motif" placeholder={type === "retard" ? t("Transport, réveil tardif…", "Transport, overslept…") : t("Rendez-vous médical, appel des parents…", "Medical appointment, parents' call…")} />
          </Field>
          <SubmitButton className="w-full">{t("Enregistrer", "Save")}</SubmitButton>
          <p className="text-center text-xs text-muted">{t("Le parent est notifié automatiquement.", "The parent is notified automatically.")}</p>
        </>
      )}
    </ActionForm>
  );
}
