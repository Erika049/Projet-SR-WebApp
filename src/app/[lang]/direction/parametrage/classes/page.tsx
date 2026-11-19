// Route : /[lang]/direction/parametrage/classes — Classes de l'année (CU-DIR-02).
import { getT } from "@/lib/i18n/server";
import { nomCivil } from "@/lib/utils";
import { listerClasses } from "@/features/parametrage/queries";
import { listerEnseignants } from "@/features/personnel/queries";
import { modifierClasse } from "@/features/parametrage/actions";
import { ModifierClasseForm, NouvelleClasseForm } from "@/features/parametrage/components/forms";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/data-table";
import { Dialog } from "@/components/ui/dialog";

export default async function ParametrageClassesPage() {
  const [t, classes, enseignants] = await Promise.all([getT(), listerClasses(), listerEnseignants()]);
  return (
    <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
      <Card>
        <CardHeader titre={t("Classes de l'année", "Classes of the year")} />
        <Table>
          <thead>
            <tr>
              <Th>{t("Classe", "Class")}</Th>
              <Th>{t("Cycle", "Cycle")}</Th>
              <Th>{t("Capacité", "Capacity")}</Th>
              <Th>{t("Titulaire", "Form teacher")}</Th>
              <Th>{t("Matières", "Subjects")}</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {classes.map((c) => (
              <tr key={c.id}>
                <Td className="font-semibold">{c.libelle}</Td>
                <Td>{c.cycle === "premier" ? t("Premier cycle", "Lower") : t("Second cycle", "Upper")}</Td>
                <Td>{c.capacite}</Td>
                <Td className={c.titulaire ? "" : "text-amber-700"}>{c.titulaire ? nomCivil(c.titulaire) : t("À définir", "To be set")}</Td>
                <Td>{c.nbMatieres}</Td>
                <Td className="text-right">
                  <Dialog declencheur={t("Modifier", "Edit")} titre={c.libelle}>
                    <ModifierClasseForm action={modifierClasse.bind(null, c.id)} capacite={c.capacite} titulaireId={c.titulaireId} enseignants={enseignants} />
                  </Dialog>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
      <Card className="h-fit">
        <CardHeader titre={t("Nouvelle classe", "New class")} />
        <NouvelleClasseForm enseignants={enseignants} />
      </Card>
    </div>
  );
}
