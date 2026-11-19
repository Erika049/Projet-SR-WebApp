// Route : /[lang]/secretariat/eleves/nouveau — Inscrire un élève et enregistrer son tuteur (CU-SEC-01, CU-SEC-04).
import { getLang, getT } from "@/lib/i18n/server";
import { classes as lireClasses } from "@/lib/api/backend";
import { inscrireEleve } from "@/features/eleves/actions";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Choix, Field, Input, Select } from "@/components/ui/form-field";
import { Formulaire } from "@/components/ui/formulaire";

export default async function NouvelElevePage() {
  const [t, lang, classes] = await Promise.all([getT(), getLang(), lireClasses()]);
  return (
    <>
      <PageHeader titre={t("Inscrire un élève", "Enrol a student")} filAriane={[{ href: `/${lang}/secretariat/eleves`, libelle: t("Élèves", "Students") }]} />
      <PageBody>
        <Card className="max-w-3xl">
          <Formulaire action={inscrireEleve} libelle={t("Inscrire l'élève", "Enrol student")} reinitialiser={false}>
            <CardHeader titre={t("Élève", "Student")} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t("Nom", "Last name")}><Input name="nom" required /></Field>
              <Field label={t("Prénom", "First name")}><Input name="prenom" required /></Field>
              <Field label={t("Sexe", "Sex")}><Choix name="sexe" defaut="F" options={[{ value: "F", label: t("Féminin", "Female") }, { value: "M", label: t("Masculin", "Male") }]} /></Field>
              <Field label={t("Date de naissance", "Date of birth")}><Input type="date" name="dateNaissance" required /></Field>
              <Field label={t("Lieu de naissance", "Place of birth")}><Input name="lieuNaissance" /></Field>
              <Field label={t("Nationalité", "Nationality")}><Input name="nationalite" defaultValue="Camerounaise" /></Field>
              <Field label={t("Matricule", "Student ID")}><Input name="matricule" placeholder="LBB-26-0500" required /></Field>
              <Field label={t("Classe", "Class")}><Select name="classeId" vide={t("À affecter plus tard", "Assign later")} options={classes.map((c) => ({ value: c.id, label: c.nom }))} /></Field>
              <Field label={t("Type d'inscription", "Enrolment type")}>
                <Select name="type" options={[{ value: "NOUVEAU", label: t("Nouvelle inscription", "New enrolment") }, { value: "REINSCRIPTION", label: t("Réinscription", "Re-enrolment") }, { value: "TRANSFERT_ENTRANT", label: t("Transfert entrant", "Transfer in") }]} />
              </Field>
              <label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" name="redoublant" /> {t("Redoublant", "Repeating")}</label>
            </div>
            <CardHeader
              titre={t("Parent ou tuteur", "Parent or guardian")}
              sousTitre={t("Facultatif. S'il a déjà un compte SchoolConnect il est lié tout de suite ; sinon un code de liaison est généré pour l'application mobile.", "Optional. If they already have a SchoolConnect account they are linked at once; otherwise a link code is generated for the mobile app.")}
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label={t("Prénom", "First name")}><Input name="tuteurPrenom" /></Field>
              <Field label={t("Nom", "Last name")}><Input name="tuteurNom" /></Field>
              <Field label={t("Téléphone", "Phone")}><Input name="tuteurTelephone" placeholder="6XX XX XX XX" /></Field>
            </div>
            <Field label={t("Lien", "Relationship")}>
              <Choix name="tuteurLien" defaut="MERE" options={[{ value: "MERE", label: t("Mère", "Mother") }, { value: "PERE", label: t("Père", "Father") }, { value: "TUTEUR_LEGAL", label: t("Tuteur légal", "Legal guardian") }, { value: "AUTRE", label: t("Autre", "Other") }]} />
            </Field>
          </Formulaire>
        </Card>
      </PageBody>
    </>
  );
}
