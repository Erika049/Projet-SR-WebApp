"use client";
// Formulaires du paramétrage de l'année (CU-DIR-02).
import type { EtatFormulaire } from "@/lib/actions";
import { ActionForm } from "@/components/ui/action-form";
import { Field, Input, Select } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { useT } from "@/lib/i18n/client";
import { ajouterEvenement, creerClasse, enregistrerAnnee, enregistrerEvaluation, enregistrerMatiere } from "@/features/parametrage/actions";
import type { AnneeScolaire, Matiere, ParametresEvaluation } from "@/types/domain";

type Action = (e: EtatFormulaire, fd: FormData) => Promise<EtatFormulaire>;

export function AnneeForm({ annee }: { annee: AnneeScolaire }) {
  const t = useT();
  return (
    <ActionForm action={enregistrerAnnee}>
      {({ erreurs: e = {} }) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("Libellé", "Label")} erreur={e.libelle}><Input name="libelle" defaultValue={annee.libelle} /></Field>
            <Field label={t("Régime", "System")}>
              <Select name="regime" defaultValue={annee.regime} options={[{ value: "trimestriel", label: t("Trimestriel (3 trimestres, 6 séquences)", "Terms (3 terms, 6 sequences)") }, { value: "semestriel", label: t("Semestriel", "Semesters") }]} />
            </Field>
            <Field label={t("Début des cours", "Classes start")} erreur={e.debut}><Input type="date" name="debut" defaultValue={annee.debut} /></Field>
            <Field label={t("Fin des cours", "Classes end")} erreur={e.fin}><Input type="date" name="fin" defaultValue={annee.fin} /></Field>
          </div>
          <SubmitButton>{t("Enregistrer", "Save")}</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}

export function PeriodeForm({ action, debut, fin, statut, sequence, saisieJusquau }: { action: Action; debut: string; fin: string; statut: string; sequence?: boolean; saisieJusquau?: string | null }) {
  const t = useT();
  const statuts = sequence
    ? [{ value: "a_venir", label: t("À venir", "Upcoming") }, { value: "saisie_ouverte", label: t("Saisie ouverte", "Entry open") }, { value: "cloturee", label: t("Clôturée", "Closed") }]
    : [{ value: "a_venir", label: t("À venir", "Upcoming") }, { value: "en_cours", label: t("En cours", "In progress") }, { value: "cloture", label: t("Clôturé", "Closed") }];
  return (
    <ActionForm action={action}>
      {({ erreurs: e = {} }) => (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("Début", "Start")}><Input type="date" name="debut" defaultValue={debut} /></Field>
            <Field label={t("Fin", "End")} erreur={e.fin}><Input type="date" name="fin" defaultValue={fin} /></Field>
            <Field label={t("Statut", "Status")}><Select name="statut" defaultValue={statut} options={statuts} /></Field>
            {sequence && <Field label={t("Saisie ouverte jusqu'au", "Entry open until")}><Input type="date" name="saisieJusquau" defaultValue={saisieJusquau ?? ""} /></Field>}
          </div>
          <SubmitButton>{t("Enregistrer", "Save")}</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}

export function NouvelleClasseForm({ enseignants }: { enseignants: { id: string; nom: string }[] }) {
  const t = useT();
  return (
    <ActionForm action={creerClasse} reinitialiser>
      {({ erreurs: e = {} }) => (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("Niveau", "Level")}>
              <Select name="niveau" options={["6e", "5e", "4e", "3e", "2nde", "1ère", "Tle"].map((n) => ({ value: n, label: n }))} />
            </Field>
            <Field label={t("Nom de la classe", "Class name")} erreur={e.libelle}><Input name="libelle" placeholder="3e C" /></Field>
            <Field label={t("Cycle", "Cycle")}>
              <Select name="cycle" options={[{ value: "premier", label: t("Premier cycle", "Lower secondary") }, { value: "second", label: t("Second cycle", "Upper secondary") }]} />
            </Field>
            <Field label={t("Capacité", "Capacity")} erreur={e.capacite}><Input type="number" name="capacite" defaultValue={60} min={1} /></Field>
            <Field label={t("Sous-système", "Sub-system")}>
              <Select name="sousSysteme" options={[{ value: "francophone", label: t("Francophone", "French-speaking") }, { value: "anglophone", label: t("Anglophone", "English-speaking") }]} />
            </Field>
            <Field label={t("Titulaire", "Form teacher")}>
              <Select name="titulaireId" vide={t("À définir", "To be set")} options={enseignants.map((p) => ({ value: p.id, label: p.nom }))} />
            </Field>
          </div>
          <p className="text-xs text-muted">{t("Les matières du niveau sont reprises automatiquement.", "The level's subjects are applied automatically.")}</p>
          <SubmitButton>{t("Créer la classe", "Create class")}</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}

export function ModifierClasseForm({ action, capacite, titulaireId, enseignants }: { action: Action; capacite: number; titulaireId: string | null; enseignants: { id: string; nom: string }[] }) {
  const t = useT();
  return (
    <ActionForm action={action}>
      {() => (
        <>
          <Field label={t("Capacité", "Capacity")}><Input type="number" name="capacite" defaultValue={capacite} min={1} /></Field>
          <Field label={t("Titulaire", "Form teacher")}>
            <Select name="titulaireId" defaultValue={titulaireId ?? ""} vide={t("À définir", "To be set")} options={enseignants.map((p) => ({ value: p.id, label: p.nom }))} />
          </Field>
          <SubmitButton>{t("Enregistrer", "Save")}</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}

export function MatiereForm({ matiere }: { matiere?: Matiere }) {
  const t = useT();
  return (
    <ActionForm action={enregistrerMatiere} reinitialiser={!matiere}>
      {({ erreurs: e = {} }) => (
        <>
          {matiere && <input type="hidden" name="id" value={matiere.id} />}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("Code", "Code")} erreur={e.code}><Input name="code" defaultValue={matiere?.code} maxLength={8} /></Field>
            <Field label={t("Libellé", "Name")} erreur={e.libelle}><Input name="libelle" defaultValue={matiere?.libelle} /></Field>
            <Field label={t("Groupe (bulletin)", "Group (report card)")}>
              <Select name="groupe" defaultValue={String(matiere?.groupe ?? 1)} options={[1, 2, 3].map((g) => ({ value: String(g), label: `${t("Groupe", "Group")} ${g}` }))} />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label={t("Coef. 1er cycle", "Coef. lower")}><Input type="number" step="0.5" min={0} max={10} name="coefficientPremierCycle" defaultValue={matiere?.coefficientPremierCycle ?? 2} /></Field>
              <Field label={t("Coef. 2nd cycle", "Coef. upper")}><Input type="number" step="0.5" min={0} max={10} name="coefficientSecondCycle" defaultValue={matiere?.coefficientSecondCycle ?? 2} /></Field>
            </div>
          </div>
          <SubmitButton>{matiere ? t("Enregistrer", "Save") : t("Ajouter la matière", "Add subject")}</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}

export function EvenementForm() {
  const t = useT();
  return (
    <ActionForm action={ajouterEvenement} reinitialiser>
      {({ erreurs: e = {} }) => (
        <>
          <Field label={t("Libellé", "Name")} erreur={e.libelle}><Input name="libelle" /></Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label={t("Type", "Type")}>
              <Select name="type" options={[{ value: "evenement", label: t("Événement", "Event") }, { value: "examen", label: t("Compositions", "Exams") }, { value: "conge", label: t("Congé", "Holiday") }]} />
            </Field>
            <Field label={t("Du", "From")} erreur={e.debut}><Input type="date" name="debut" /></Field>
            <Field label={t("Au", "To")} erreur={e.fin}><Input type="date" name="fin" /></Field>
          </div>
          <SubmitButton>{t("Ajouter", "Add")}</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}

export function EvaluationForm({ valeurs }: { valeurs: ParametresEvaluation }) {
  const t = useT();
  const champs: [keyof ParametresEvaluation, string, string][] = [
    ["bareme", t("Barème (note maximale)", "Scale (max mark)"), ""],
    ["seuilReussite", t("Moyenne de réussite", "Pass mark"), ""],
    ["seuilTableauHonneur", t("Seuil du tableau d'honneur", "Honour roll threshold"), ""],
    ["seuilAvertissement", t("Seuil d'avertissement", "Warning threshold"), ""],
    ["decimales", t("Décimales des moyennes", "Average decimals"), ""],
    ["delaiJustificationHeures", t("Délai de justification d'une absence (heures)", "Absence justification delay (hours)"), ""],
  ];
  return (
    <ActionForm action={enregistrerEvaluation}>
      {({ erreurs: e = {} }) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {champs.map(([k, l]) => (
              <Field key={k} label={l} erreur={e[k]}>
                <Input type="number" step="0.5" name={k} defaultValue={valeurs[k]} />
              </Field>
            ))}
          </div>
          <SubmitButton>{t("Enregistrer", "Save")}</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}
