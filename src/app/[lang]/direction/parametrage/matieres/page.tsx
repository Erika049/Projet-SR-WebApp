// Route : /[lang]/direction/parametrage/matieres — Matières et coefficients.
import { getT } from "@/lib/i18n/server";
import { matieres as lireMatieres } from "@/lib/api/backend";
import { creerMatiere } from "@/features/parametrage/actions";
import { Card, CardHeader } from "@/components/ui/card";
import { LigneVide, Table, Td, Th } from "@/components/ui/data-table";
import { Field, Input } from "@/components/ui/form-field";
import { Formulaire } from "@/components/ui/formulaire";

export default async function MatieresPage() {
  const [t, matieres] = await Promise.all([getT(), lireMatieres()]);
  return (
    <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
      <Card>
        <CardHeader titre={t(`${matieres.length} matières`, `${matieres.length} subjects`)} />
        <Table>
          <thead>
            <tr><Th>{t("Matière", "Subject")}</Th><Th>{t("Code", "Code")}</Th><Th>{t("Coefficient", "Coefficient")}</Th></tr>
          </thead>
          <tbody>
            {matieres.length === 0 && <LigneVide colSpan={3} texte={t("Aucune matière.", "No subject.")} />}
            {matieres.map((m) => (
              <tr key={m.id}><Td className="font-semibold">{m.nom}</Td><Td className="font-mono text-xs">{m.code}</Td><Td>{m.coefficientDefaut}</Td></tr>
            ))}
          </tbody>
        </Table>
      </Card>
      <Card className="h-fit">
        <CardHeader titre={t("Nouvelle matière", "New subject")} />
        <Formulaire action={creerMatiere} libelle={t("Créer la matière", "Create subject")}>
          <Field label={t("Nom", "Name")}><Input name="nom" required /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("Code", "Code")}><Input name="code" maxLength={20} required /></Field>
            <Field label={t("Coefficient", "Coefficient")}><Input name="coefficient" inputMode="decimal" required /></Field>
          </div>
        </Formulaire>
      </Card>
    </div>
  );
}
