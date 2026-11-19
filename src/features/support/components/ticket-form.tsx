"use client";

import { creerTicket } from "@/features/support/actions";
import { ActionForm } from "@/components/ui/action-form";
import { Field, Input, Select, Textarea } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { useT } from "@/lib/i18n/client";

/** Demande d'assistance au support SchoolConnect. */
export function TicketForm() {
  const t = useT();
  return (
    <ActionForm action={creerTicket} reinitialiser>
      {(etat) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("Type de demande", "Request type")}>
              <Select name="type" options={[{ value: "bug", label: t("Bug / problème", "Bug / issue") }, { value: "question", label: t("Question", "Question") }, { value: "demande", label: t("Demande d'évolution", "Feature request") }]} />
            </Field>
            <Field label={t("Module concerné", "Module")}>
              <Select
                name="module"
                options={["Élèves", "Personnel", "Notes et bulletins", "Présences", "Finances", "Annonces", "Paramétrage", "Abonnement", "Autre"].map((m) => ({ value: m, label: m }))}
              />
            </Field>
          </div>
          <Field label={t("Objet", "Subject")} erreur={etat.erreurs?.objet}>
            <Input name="objet" />
          </Field>
          <Field label={t("Description", "Description")} erreur={etat.erreurs?.description}>
            <Textarea name="description" rows={5} />
          </Field>
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-muted">
            {t("Informations jointes automatiquement : navigateur, page ouverte et établissement, pour aider le support à reproduire le problème.", "Attached automatically: browser, open page and school, to help support reproduce the issue.")}
          </p>
          <SubmitButton>{t("Envoyer au support", "Send to support")}</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}
