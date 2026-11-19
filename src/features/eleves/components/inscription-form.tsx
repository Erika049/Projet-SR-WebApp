"use client";
// CU-SEC-01 + CU-SEC-04 : inscrire un nouvel élève, enregistrer le tuteur et générer le code de liaison.
import Link from "next/link";
import { useActionState } from "react";
import { CheckCircle2, KeyRound } from "lucide-react";
import { inscrireEleve } from "@/features/eleves/actions";
import { ETAT_INITIAL } from "@/lib/actions";
import { useLang, useT } from "@/lib/i18n/client";
import { Card, CardHeader, Note } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/form-field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { classesBouton } from "@/components/ui/button";

export function InscriptionForm({ classes }: { classes: { id: string; libelle: string; places: number }[] }) {
  const t = useT();
  const lang = useLang();
  const [etat, action] = useActionState(inscrireEleve, ETAT_INITIAL);
  const e = etat.erreurs ?? {};
  const base = `/${lang}/secretariat/eleves`;

  return (
    <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
      <form action={action} className="space-y-6" key={etat.ok ? String(etat.donnees?.id) : "form"}>
        <FormMessage etat={etat} />
        <Card>
          <CardHeader titre={t("Identité de l'élève", "Student identity")} sousTitre={t("Le matricule est généré automatiquement à l'enregistrement.", "The student ID is generated automatically on save.")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("Nom", "Last name")} erreur={e.nom}><Input name="nom" autoComplete="off" /></Field>
            <Field label={t("Prénom", "First name")} erreur={e.prenom}><Input name="prenom" autoComplete="off" /></Field>
            <Field label={t("Date de naissance", "Date of birth")} erreur={e.dateNaissance}><Input type="date" name="dateNaissance" /></Field>
            <Field label={t("Sexe", "Sex")} erreur={e.sexe}>
              <Select name="sexe" vide={t("Choisir…", "Choose…")} options={[{ value: "F", label: t("Féminin", "Female") }, { value: "M", label: t("Masculin", "Male") }]} />
            </Field>
            <Field label={t("Classe", "Class")} erreur={e.classeId}>
              <Select name="classeId" vide={t("Choisir…", "Choose…")} options={classes.map((c) => ({ value: c.id, label: `${c.libelle} · ${c.places} ${t("place(s)", "seat(s)")}` }))} />
            </Field>
            <Field label={t("Lieu de naissance", "Place of birth")}><Input name="lieuNaissance" /></Field>
          </div>
        </Card>
        <Card>
          <CardHeader titre={t("Parent ou tuteur", "Parent or guardian")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("Nom complet", "Full name")} erreur={e.tuteurNom}><Input name="tuteurNom" /></Field>
            <Field label={t("Téléphone", "Phone")} erreur={e.tuteurTelephone}><Input name="tuteurTelephone" placeholder="+237 6XX XXX XXX" /></Field>
            <Field label={t("Lien avec l'élève", "Relationship")}>
              <Select name="tuteurLien" options={[{ value: "mere", label: t("Mère", "Mother") }, { value: "pere", label: t("Père", "Father") }, { value: "tuteur_legal", label: t("Tuteur légal", "Legal guardian") }, { value: "autre", label: t("Autre", "Other") }]} />
            </Field>
          </div>
        </Card>
        <div className="flex gap-2">
          <Link href={base} className={classesBouton("secondaire")}>{t("Annuler", "Cancel")}</Link>
          <SubmitButton>{t("Enregistrer l'élève", "Save student")}</SubmitButton>
        </div>
      </form>
      <div className="space-y-6">
        <Card>
          <CardHeader titre={t("Code de liaison", "Link code")} />
          {etat.ok && etat.donnees ? (
            <div className="space-y-3 text-center">
              <CheckCircle2 className="mx-auto size-8 text-brand-600" />
              <p className="text-sm text-muted">{t("Matricule", "Student ID")} <strong className="font-mono text-ink">{etat.donnees.matricule}</strong></p>
              <p className="rounded-xl border-2 border-dashed border-navy-700 py-3 font-mono text-2xl font-bold tracking-widest text-navy-800">{etat.donnees.codeLiaison}</p>
              <div className="flex flex-col gap-2">
                <Link href={`${base}/${etat.donnees.id}/fiche-liaison`} className={classesBouton("primaire")}>{t("Imprimer la fiche de liaison", "Print the link sheet")}</Link>
                <Link href={`${base}/${etat.donnees.id}`} className={classesBouton("secondaire")}>{t("Ouvrir le dossier", "Open the file")}</Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <p className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 py-4 font-mono text-2xl text-slate-300"><KeyRound className="size-5" /> ···-···</p>
              <p className="text-muted">{t("Généré après l'enregistrement. Remettez ce code au parent : il lui permet de lier son compte à son enfant dans l'application SchoolConnect.", "Generated after saving. Give this code to the parent: it lets them link their account to their child in the SchoolConnect app.")}</p>
              <p className="text-xs text-muted">{t("Imprimable sur une fiche.", "Printable on a sheet.")}</p>
            </div>
          )}
        </Card>
        <Note titre={t("Correction d'identité", "Identity correction")}>
          {t("Une fois l'élève enregistré, toute correction d'identité passe par la validation du directeur.", "Once the student is saved, any identity correction requires the principal's approval.")}
        </Note>
      </div>
    </div>
  );
}
