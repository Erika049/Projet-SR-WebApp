"use client";
// Assistant « Ajouter un membre du personnel » : Identité → Poste et affectations → Accès (une seule page, 3 sections).
import Link from "next/link";
import { useActionState, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { ajouterMembre } from "@/features/personnel/actions";
import { ETAT_INITIAL } from "@/lib/actions";
import { useLang, useT } from "@/lib/i18n/client";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/form-field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { Stepper } from "@/components/ui/stepper";
import { classesBouton } from "@/components/ui/button";

export function MembreForm({ classes, matieres, matricule }: { classes: { id: string; libelle: string }[]; matieres: string[]; matricule: string }) {
  const t = useT();
  const lang = useLang();
  const [etat, action] = useActionState(ajouterMembre, ETAT_INITIAL);
  const [fonction, setFonction] = useState("enseignant");
  const [choisies, setChoisies] = useState<string[]>([]);
  const e = etat.erreurs ?? {};

  if (etat.ok && etat.donnees)
    return (
      <Card className="mx-auto max-w-xl text-center">
        <CheckCircle2 className="mx-auto size-12 text-brand-600" />
        <h2 className="mt-3 text-xl font-bold text-navy-800">{t("Membre enregistré", "Staff member saved")}</h2>
        <p className="mt-1 text-sm text-muted">{etat.message}</p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href={`/${lang}/direction/personnel/${etat.donnees.id}`} className={classesBouton("primaire")}>{t("Voir la fiche", "View profile")}</Link>
          <Link href={`/${lang}/direction/personnel`} className={classesBouton("secondaire")}>{t("Retour à la liste", "Back to list")}</Link>
        </div>
      </Card>
    );

  const enseignant = fonction === "enseignant";
  return (
    <form action={action} className="grid gap-6 xl:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        <Stepper etapes={[t("Identité", "Identity"), t("Poste et affectations", "Position and assignments"), t("Accès", "Access")]} courante={1} />
        <FormMessage etat={etat} />
        <Card>
          <CardHeader titre={t("Identité", "Identity")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("Civilité", "Title")}>
              <Select name="civilite" options={[{ value: "M.", label: "M." }, { value: "Mme", label: "Mme" }]} />
            </Field>
            <Field label={t("Sexe", "Sex")}>
              <Select name="sexe" options={[{ value: "M", label: t("Masculin", "Male") }, { value: "F", label: t("Féminin", "Female") }]} />
            </Field>
            <Field label={t("Nom", "Last name")} erreur={e.nom}><Input name="nom" /></Field>
            <Field label={t("Prénom", "First name")} erreur={e.prenom}><Input name="prenom" /></Field>
            <Field label={t("Date de naissance", "Date of birth")} erreur={e.dateNaissance}><Input type="date" name="dateNaissance" /></Field>
            <Field label={t("Téléphone", "Phone")} erreur={e.telephone}><Input name="telephone" placeholder="+237 6XX XXX XXX" /></Field>
            <Field label={t("Courriel", "Email")} erreur={e.email} className="sm:col-span-2"><Input type="email" name="email" /></Field>
          </div>
        </Card>
        <Card>
          <CardHeader titre={t("Poste et affectations", "Position and assignments")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("Fonction", "Role")}>
              <Select
                name="fonction"
                value={fonction}
                onChange={(ev) => setFonction(ev.target.value)}
                options={[
                  { value: "enseignant", label: t("Enseignant", "Teacher") },
                  { value: "surveillant_general", label: t("Surveillant général", "Head of discipline") },
                  { value: "surveillant", label: t("Surveillant", "Supervisor") },
                  { value: "secretaire", label: t("Secrétaire", "Secretary") },
                  { value: "comptable", label: t("Comptable", "Bursar") },
                ]}
              />
            </Field>
            <Field label={t("Spécialité / matière", "Specialty / subject")} erreur={e.specialite}>
              {enseignant ? <Select name="specialite" vide={t("Choisir…", "Choose…")} options={matieres.map((m) => ({ value: m, label: m }))} /> : <Input name="specialite" />}
            </Field>
            <Field label={t("Type de contrat", "Contract type")}>
              <Select
                name="contrat"
                options={[
                  { value: "permanent", label: t("Permanent", "Permanent") },
                  { value: "vacataire", label: t("Vacataire", "Part-time") },
                  { value: "contractuel", label: t("Contractuel", "Contract") },
                  { value: "fonctionnaire", label: t("Fonctionnaire", "Civil servant") },
                ]}
              />
            </Field>
            <Field label={t("Date de prise de service", "Start date")} erreur={e.datePriseService}><Input type="date" name="datePriseService" /></Field>
            {enseignant && (
              <>
                <div className="sm:col-span-2">
                  <p className="mb-1.5 text-sm font-semibold">{t("Classes affectées", "Assigned classes")}</p>
                  <div className="flex flex-wrap gap-2">
                    {classes.map((c) => (
                      <label key={c.id} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-line px-2.5 py-1 text-sm has-checked:border-navy-700 has-checked:bg-navy-50">
                        <input type="checkbox" name="classeIds" value={c.id} className="accent-navy-700" onChange={(ev) => setChoisies((s) => (ev.target.checked ? [...s, c.id] : s.filter((x) => x !== c.id)))} />
                        {c.libelle}
                      </label>
                    ))}
                  </div>
                </div>
                <Field label={t("Heures par semaine", "Hours per week")}><Input type="number" name="heuresSemaine" min={0} max={60} defaultValue={18} /></Field>
                <Field label={t("Titulaire de classe", "Form teacher of")}>
                  <Select name="titulaireDe" vide={t("Aucune", "None")} options={classes.filter((c) => choisies.includes(c.id)).map((c) => ({ value: c.id, label: c.libelle }))} />
                </Field>
              </>
            )}
            {!enseignant && <input type="hidden" name="heuresSemaine" value="40" />}
            {!enseignant && <input type="hidden" name="titulaireDe" value="" />}
          </div>
        </Card>
        <Card>
          <CardHeader titre={t("Accès à SchoolConnect", "SchoolConnect access")} />
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="creerCompte" defaultChecked className="size-4 accent-brand-600" />
            <span>
              <span className="font-semibold">{t("Créer le compte maintenant", "Create the account now")}</span>
              <span className="block text-muted">{t("Application mobile pour les enseignants · web pour la secrétaire et le surveillant général", "Mobile app for teachers · web for the secretary and head of discipline")}</span>
            </span>
          </label>
        </Card>
        <div className="flex gap-2">
          <Link href={`/${lang}/direction/personnel`} className={classesBouton("secondaire")}>{t("Annuler", "Cancel")}</Link>
          <SubmitButton>{t("Enregistrer le membre", "Save member")}</SubmitButton>
        </div>
      </div>
      <Card className="h-fit space-y-3 text-sm">
        <CardHeader titre={t("Ce qui sera créé", "What will be created")} />
        <p>✓ {t("Un matricule", "An ID")} : <strong className="font-mono">{matricule}</strong></p>
        <p>✓ {t("La fiche du membre et sa fonction", "The staff profile and role")}</p>
        <p>✓ {t("L'affectation aux classes et aux matières", "Class and subject assignments")}</p>
        <p>✓ {t("Une invitation par courriel et SMS", "An invitation by email and SMS")}</p>
        <p>✓ {t("Sa présence dans les appels et les notes (mobile)", "Presence in roll calls and marks (mobile)")}</p>
        <p className="rounded-lg bg-navy-50 p-3 text-navy-800">
          <strong>{t("Invitation sécurisée", "Secure invitation")}</strong>
          <br />
          {t("Le membre reçoit un lien pour choisir son mot de passe. La direction ne voit jamais ce mot de passe.", "The member receives a link to choose their password. Management never sees it.")}
        </p>
      </Card>
    </form>
  );
}
