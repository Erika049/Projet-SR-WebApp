// Route : /[lang]/plateforme/etablissements/nouveau — Créer un établissement, son année scolaire et son directeur (CU-SAD-01/02).
import { getLang, getT } from "@/lib/i18n/server";
import { creerEtablissement } from "@/features/plateforme/actions";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/form-field";
import { Formulaire } from "@/components/ui/formulaire";

export default async function NouvelEtablissementPage() {
  const [t, lang] = await Promise.all([getT(), getLang()]);
  const annee = new Date().getFullYear();
  return (
    <>
      <PageHeader titre={t("Créer un établissement", "Create a school")} filAriane={[{ href: `/${lang}/plateforme/etablissements`, libelle: t("Établissements", "Schools") }]} />
      <PageBody>
        <Card className="max-w-3xl">
          <Formulaire action={creerEtablissement} libelle={t("Créer l'établissement", "Create school")} reinitialiser={false}>
            <CardHeader titre={t("Établissement", "School")} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t("Nom", "Name")}><Input name="nom" required /></Field>
              <Field label={t("Code", "Code")}><Input name="code" maxLength={30} required /></Field>
              <Field label={t("Type", "Type")}><Select name="type" options={[{ value: "PUBLIC", label: t("Public", "Public") }, { value: "PRIVE_LAIC", label: t("Privé laïc", "Private secular") }, { value: "PRIVE_CONFESSIONNEL", label: t("Privé confessionnel", "Private religious") }]} /></Field>
              <Field label={t("Sous-système", "Subsystem")}><Select name="sousSysteme" options={[{ value: "FRANCOPHONE", label: t("Francophone", "French") }, { value: "ANGLOPHONE", label: t("Anglophone", "English") }, { value: "BILINGUE", label: t("Bilingue", "Bilingual") }]} /></Field>
              <Field label={t("Ordre d'enseignement", "Education type")}><Select name="ordreEnseignement" options={[{ value: "GENERAL", label: t("Général", "General") }, { value: "TECHNIQUE", label: t("Technique", "Technical") }, { value: "LES_DEUX", label: t("Les deux", "Both") }]} /></Field>
              <Field label={t("Région", "Region")}><Input name="region" /></Field>
              <Field label={t("Ville", "City")}><Input name="ville" /></Field>
              <Field label={t("Adresse", "Address")}><Input name="adresse" /></Field>
              <Field label={t("Téléphone", "Phone")}><Input name="telephone" /></Field>
              <Field label={t("Courriel", "Email")}><Input type="email" name="email" /></Field>
            </div>
            <CardHeader titre={t("Année scolaire", "School year")} />
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label={t("Libellé", "Label")}><Input name="anneeLibelle" defaultValue={`${annee}-${annee + 1}`} required /></Field>
              <Field label={t("Début", "Start")}><Input type="date" name="anneeDebut" defaultValue={`${annee}-09-01`} required /></Field>
              <Field label={t("Fin", "End")}><Input type="date" name="anneeFin" defaultValue={`${annee + 1}-07-31`} required /></Field>
            </div>
            <CardHeader titre={t("Directeur", "Principal")} sousTitre={t("Son compte web est créé avec ce mot de passe initial.", "Their web account is created with this initial password.")} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t("Prénom", "First name")}><Input name="dirPrenom" required /></Field>
              <Field label={t("Nom", "Last name")}><Input name="dirNom" required /></Field>
              <Field label={t("Adresse e-mail (identifiant de connexion)", "Email (sign-in ID)")}><Input type="email" name="dirEmail" required /></Field>
              <Field label={t("Téléphone (facultatif)", "Phone (optional)")}><Input name="dirTelephone" /></Field>
              <Field label={t("Mot de passe initial", "Initial password")}><Input name="dirMotDePasse" minLength={8} required /></Field>
            </div>
          </Formulaire>
        </Card>
      </PageBody>
    </>
  );
}
