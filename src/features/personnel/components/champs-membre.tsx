// Champs du formulaire « Ajouter un membre du personnel » (direction ou super-admin).
import { getT } from "@/lib/i18n/server";
import { ROLES_PERSONNEL } from "@/features/personnel/libelles";
import { Field, Input, Select } from "@/components/ui/form-field";

export async function ChampsMembre({ roles = Object.keys(ROLES_PERSONNEL) }: { roles?: string[] }) {
  const t = await getT();
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t("Prénom", "First name")}><Input name="prenom" required /></Field>
        <Field label={t("Nom", "Last name")}><Input name="nom" required /></Field>
        <Field label={t("Adresse e-mail", "Email")} aide={t("Connexion à l'application web (direction, secrétariat, surveillance, économat).", "Web app sign-in.")}>
          <Input type="email" name="email" />
        </Field>
        <Field label={t("Téléphone", "Phone")} aide={t("Obligatoire pour un enseignant : connexion à l'application mobile.", "Required for a teacher: mobile app sign-in.")}>
          <Input name="telephone" placeholder="6XX XX XX XX" />
        </Field>
      </div>
      <Field label={t("Rôle", "Role")}>
        <Select name="role" options={roles.map((r) => ({ value: r, label: t(...ROLES_PERSONNEL[r]) }))} />
      </Field>
      <Field
        label={t("Mot de passe initial", "Initial password")}
        aide={t("8 caractères minimum. Inutile si la personne a déjà un compte SchoolConnect : le rôle lui est ajouté.", "At least 8 characters. Not needed if the person already has a SchoolConnect account: the role is added.")}
      >
        <Input name="motDePasse" type="text" autoComplete="off" minLength={8} />
      </Field>
    </>
  );
}
