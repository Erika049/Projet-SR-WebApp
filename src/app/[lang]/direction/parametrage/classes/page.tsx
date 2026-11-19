// Route : /[lang]/direction/parametrage/classes — Classes de l'année courante.
import { getT } from "@/lib/i18n/server";
import { anneeCourante, classes as lireClasses, repertoire } from "@/lib/api/backend";
import { creerClasse } from "@/features/parametrage/actions";
import { Card, CardHeader } from "@/components/ui/card";
import { LigneVide, Table, Td, Th } from "@/components/ui/data-table";
import { Field, Input } from "@/components/ui/form-field";
import { Formulaire } from "@/components/ui/formulaire";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ClassesParametragePage() {
  const [t, annee, classes, eleves] = await Promise.all([getT(), anneeCourante(), lireClasses(), repertoire()]);
  return (
    <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
      <Card>
        <CardHeader titre={t(`${classes.length} classes`, `${classes.length} classes`)} />
        <Table>
          <thead>
            <tr><Th>{t("Classe", "Class")}</Th><Th>{t("Niveau", "Level")}</Th><Th>{t("Effectif", "Students")}</Th></tr>
          </thead>
          <tbody>
            {classes.length === 0 && <LigneVide colSpan={3} texte={t("Aucune classe.", "No class.")} />}
            {classes.map((c) => (
              <tr key={c.id}>
                <Td className="font-semibold">{c.nom}</Td>
                <Td>{c.niveau}</Td>
                <Td>{eleves.filter((e) => e.classeId === c.id).length}{c.effectifMax ? ` / ${c.effectifMax}` : ""}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
      <Card className="h-fit">
        <CardHeader titre={t("Nouvelle classe", "New class")} sousTitre={t("Le niveau sert à appliquer les frais de scolarité.", "The level is used to apply school fees.")} />
        {annee ? (
          <Formulaire action={creerClasse.bind(null, annee.id)} libelle={t("Créer la classe", "Create class")}>
            <Field label={t("Nom", "Name")}><Input name="nom" placeholder="5e A" required /></Field>
            <Field label={t("Niveau", "Level")}><Input name="niveau" placeholder="5e" required /></Field>
            <Field label={t("Effectif maximum", "Maximum size")}><Input type="number" name="effectifMax" min={1} /></Field>
          </Formulaire>
        ) : (
          <EmptyState titre={t("Créez d'abord l'année scolaire", "Create the school year first")} />
        )}
      </Card>
    </div>
  );
}
