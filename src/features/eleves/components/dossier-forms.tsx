"use client";
// Formulaires du dossier élève (secrétariat) : correction, changement de classe, archivage.
import { useState } from "react";
import type { EtatFormulaire } from "@/lib/actions";
import { ActionForm } from "@/components/ui/action-form";
import { Field, Input, Select, Textarea } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { useT } from "@/lib/i18n/client";

type Action = (etat: EtatFormulaire, fd: FormData) => Promise<EtatFormulaire>;

export function CorrectionForm({ action }: { action: Action }) {
  const t = useT();
  const [champ, setChamp] = useState("nom");
  const identite = ["nom", "prenom", "dateNaissance", "lieuNaissance", "sexe"].includes(champ);
  return (
    <ActionForm action={action} reinitialiser>
      {(etat) => (
        <>
          <Field label={t("Champ à corriger", "Field to correct")}>
            <Select
              name="champ"
              value={champ}
              onChange={(e) => setChamp(e.target.value)}
              options={[
                { value: "nom", label: t("Nom", "Last name") },
                { value: "prenom", label: t("Prénom", "First name") },
                { value: "dateNaissance", label: t("Date de naissance", "Date of birth") },
                { value: "lieuNaissance", label: t("Lieu de naissance", "Place of birth") },
                { value: "sexe", label: t("Sexe", "Sex") },
                { value: "tuteurNom", label: t("Nom du tuteur", "Guardian name") },
                { value: "tuteurTelephone", label: t("Téléphone du tuteur", "Guardian phone") },
              ]}
            />
          </Field>
          <Field label={t("Nouvelle valeur", "New value")} erreur={etat.erreurs?.valeur}>
            {champ === "dateNaissance" ? (
              <Input type="date" name="valeur" />
            ) : champ === "sexe" ? (
              <Select name="valeur" options={[{ value: "F", label: t("Féminin", "Female") }, { value: "M", label: t("Masculin", "Male") }]} />
            ) : (
              <Input name="valeur" />
            )}
          </Field>
          <p className="rounded-lg bg-navy-50 px-3 py-2 text-xs text-navy-800">
            {identite
              ? t("Correction d'identité : elle sera appliquée après validation du directeur.", "Identity correction: applied after the principal's approval.")
              : t("Cette correction est appliquée immédiatement et conservée dans l'historique.", "This correction is applied immediately and kept in the history.")}
          </p>
          <SubmitButton>{t("Envoyer la correction", "Submit correction")}</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}

export function ClasseForm({ action, classes, actuelle }: { action: Action; classes: { id: string; libelle: string }[]; actuelle: string }) {
  const t = useT();
  return (
    <ActionForm action={action}>
      {() => (
        <>
          <Field label={t("Nouvelle classe", "New class")}>
            <Select name="classeId" defaultValue={actuelle} options={classes.map((c) => ({ value: c.id, label: c.libelle }))} />
          </Field>
          <SubmitButton>{t("Affecter", "Assign")}</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}

export function ArchiveForm({ action }: { action: Action }) {
  const t = useT();
  return (
    <ActionForm action={action}>
      {() => (
        <>
          <Field label={t("Motif de sortie", "Exit reason")}>
            <Select
              name="motif"
              vide={t("Choisir…", "Choose…")}
              options={[
                { value: "Transfert vers un autre établissement", label: t("Transfert vers un autre établissement", "Transfer to another school") },
                { value: "Abandon", label: t("Abandon", "Dropped out") },
                { value: "Fin de cycle", label: t("Fin de cycle", "End of cycle") },
                { value: "Exclusion", label: t("Exclusion", "Expulsion") },
              ]}
            />
          </Field>
          <Textarea name="commentaire" placeholder={t("Commentaire (facultatif)", "Comment (optional)")} className="min-h-16" />
          <SubmitButton variante="danger">{t("Archiver le dossier", "Archive the file")}</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}
