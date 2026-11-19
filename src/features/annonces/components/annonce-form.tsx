"use client";

import { useState } from "react";
import { Smartphone } from "lucide-react";
import { enregistrerAnnonce } from "@/features/annonces/actions";
import { ActionForm } from "@/components/ui/action-form";
import { Field, Input, Textarea } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

export function AnnonceForm({ classes, convocations }: { classes: { id: string; libelle: string }[]; convocations: boolean }) {
  const t = useT();
  const [titre, setTitre] = useState("");
  const [message, setMessage] = useState("");
  const [cible, setCible] = useState("tous_parents");
  const [programmer, setProgrammer] = useState(false);

  const cibles = [
    { value: "tous_parents", label: t("Tous les parents", "All parents") },
    { value: "classe", label: t("Une classe", "One class") },
    { value: "enseignants", label: t("Enseignants", "Teachers") },
    { value: "parents_enseignants", label: t("Parents et enseignants", "Parents and teachers") },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
      <ActionForm action={enregistrerAnnonce} reinitialiser>
        {(etat) => (
          <>
            {convocations && (
              <Field label={t("Type", "Type")}>
                <select name="type" className="input">
                  <option value="annonce">{t("Annonce", "Announcement")}</option>
                  <option value="convocation">{t("Convocation", "Summons")}</option>
                </select>
              </Field>
            )}
            <Field label={t("Titre", "Title")} erreur={etat.erreurs?.titre}>
              <Input name="titre" value={titre} onChange={(e) => setTitre(e.target.value)} placeholder={t("Réunion des parents d'élèves", "Parents' meeting")} />
            </Field>
            <Field label={t("Message", "Message")} erreur={etat.erreurs?.message}>
              <Textarea name="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} maxLength={1000} />
            </Field>
            <div>
              <p className="mb-1.5 text-sm font-semibold">{t("Destinataires", "Recipients")}</p>
              <div className="flex flex-wrap gap-2">
                {cibles.map((c) => (
                  <label key={c.value} className={cn("cursor-pointer rounded-lg border px-3 py-1.5 text-sm font-medium", cible === c.value ? "border-navy-700 bg-navy-700 text-white" : "border-line bg-white")}>
                    <input type="radio" name="cible" value={c.value} checked={cible === c.value} onChange={() => setCible(c.value)} className="sr-only" />
                    {c.label}
                  </label>
                ))}
              </div>
              {cible === "classe" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {classes.map((c) => (
                    <label key={c.id} className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 text-sm">
                      <input type="checkbox" name="classeIds" value={c.id} className="accent-navy-700" />
                      {c.libelle}
                    </label>
                  ))}
                </div>
              )}
              {etat.erreurs?.classeIds && <p className="mt-1 text-xs text-red-600">{etat.erreurs.classeIds}</p>}
            </div>
            <div>
              <p className="mb-1.5 text-sm font-semibold">{t("Canaux", "Channels")}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                {[
                  ["sms", "SMS"],
                  ["email", "Email"],
                  ["push", t("Notification push", "Push notification")],
                ].map(([v, l]) => (
                  <label key={v} className="flex items-center gap-2">
                    <input type="checkbox" name="canaux" value={v} defaultChecked={v === "push"} className="size-4 accent-brand-600" />
                    {l}
                  </label>
                ))}
              </div>
              {etat.erreurs?.canaux && <p className="mt-1 text-xs text-red-600">{etat.erreurs.canaux}</p>}
            </div>
            {programmer && (
              <Field label={t("Date d'envoi", "Send date")} erreur={etat.erreurs?.date} className="max-w-xs">
                <Input type="date" name="date" />
              </Field>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              <SubmitButton name="mode" value="publier" variante="succes">
                {t("Publier maintenant", "Publish now")}
              </SubmitButton>
              {programmer ? (
                <SubmitButton name="mode" value="programmer" variante="secondaire">
                  {t("Confirmer la programmation", "Confirm schedule")}
                </SubmitButton>
              ) : (
                <button type="button" onClick={() => setProgrammer(true)} className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-navy-700 hover:bg-navy-50">
                  {t("Programmer", "Schedule")}
                </button>
              )}
              <SubmitButton name="mode" value="brouillon" variante="fantome">
                {t("Enregistrer le brouillon", "Save draft")}
              </SubmitButton>
            </div>
          </>
        )}
      </ActionForm>
      {/* Aperçu sur le téléphone du parent */}
      <div className="hidden lg:block">
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted">
          <Smartphone className="size-4" /> {t("Aperçu sur le téléphone", "Phone preview")}
        </p>
        <div className="rounded-[2rem] border-8 border-navy-900 bg-slate-100 p-3 shadow-lg">
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <p className="flex justify-between text-[10px] text-muted">
              <span className="font-bold text-navy-700">SchoolConnect</span> {t("maintenant", "now")}
            </p>
            <p className="mt-1 text-sm font-bold text-ink">{titre || t("Titre de l'annonce", "Announcement title")}</p>
            <p className="mt-0.5 line-clamp-6 text-xs text-slate-600">{message || t("Votre message apparaîtra ici.", "Your message will appear here.")}</p>
          </div>
          <div className="h-48" />
        </div>
      </div>
    </div>
  );
}
