"use client";
// Grille tarifaire (CU-DIR-04) : échéancier d'un niveau et remises.
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { enregistrerRemise, enregistrerTarif } from "@/features/finances/actions";
import { ActionForm } from "@/components/ui/action-form";
import { Field, Input } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { useLang, useT } from "@/lib/i18n/client";
import { fcfa } from "@/lib/format";
import type { Tarif } from "@/types/domain";

export function TarifForm({ tarif, nouveau = false }: { tarif?: Tarif; nouveau?: boolean }) {
  const t = useT();
  const lang = useLang();
  const [versements, setVersements] = useState(tarif?.versements ?? [{ libelle: "1er versement", montant: 0, dateLimite: "2026-09-15" }]);
  const total = versements.reduce((s, v) => s + (Number(v.montant) || 0), 0);
  const maj = (i: number, champ: "libelle" | "montant" | "dateLimite", valeur: string) =>
    setVersements((vs) => vs.map((v, j) => (j === i ? { ...v, [champ]: champ === "montant" ? Number(valeur) : valeur } : v)));

  return (
    <ActionForm action={enregistrerTarif}>
      {() => (
        <>
          {nouveau ? (
            <Field label={t("Niveau", "Level")}>
              <Input name="niveau" placeholder="Tle" />
            </Field>
          ) : (
            <input type="hidden" name="niveau" value={tarif?.niveau} />
          )}
          <input type="hidden" name="montant" value={total} />
          <div className="space-y-2">
            {versements.map((v, i) => (
              <div key={i} className="grid grid-cols-[1fr_120px_140px_auto] items-center gap-2">
                <Input name="vLibelle" value={v.libelle} onChange={(e) => maj(i, "libelle", e.target.value)} />
                <Input name="vMontant" type="number" min={0} step={5000} value={v.montant} onChange={(e) => maj(i, "montant", e.target.value)} />
                <Input name="vDate" type="date" value={v.dateLimite} onChange={(e) => maj(i, "dateLimite", e.target.value)} />
                <button type="button" onClick={() => setVersements((vs) => vs.filter((_, j) => j !== i))} disabled={versements.length === 1} className="rounded p-1.5 text-muted hover:text-red-600 disabled:opacity-30" aria-label={t("Supprimer", "Delete")}>
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setVersements((vs) => [...vs, { libelle: `${vs.length + 1}e versement`, montant: 0, dateLimite: "2027-01-31" }])}
            className="flex items-center gap-1 text-sm font-semibold text-navy-700 hover:underline"
          >
            <Plus className="size-4" /> {t("Ajouter un versement", "Add an instalment")}
          </button>
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <span>{t("Frais annuels (total)", "Annual fees (total)")}</span>
            <strong>{fcfa(total, lang)}</strong>
          </div>
          <SubmitButton>{t("Enregistrer l'échéancier", "Save schedule")}</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}

export function RemiseForm() {
  const t = useT();
  return (
    <ActionForm action={enregistrerRemise} reinitialiser>
      {(etat) => (
        <div className="grid grid-cols-[1fr_90px] gap-2">
          <Field label={t("Libellé", "Name")} erreur={etat.erreurs?.libelle}>
            <Input name="libelle" placeholder={t("Bourse d'excellence", "Merit scholarship")} />
          </Field>
          <Field label="%" erreur={etat.erreurs?.taux}>
            <Input name="taux" type="number" min={1} max={100} />
          </Field>
          <SubmitButton variante="secondaire" taille="sm" className="col-span-2 w-fit">{t("Ajouter la remise", "Add discount")}</SubmitButton>
        </div>
      )}
    </ActionForm>
  );
}
