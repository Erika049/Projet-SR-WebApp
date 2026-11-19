// Route : /[lang]/direction/parametrage/matieres — Matières et coefficients (CU-DIR-02).
import { getT } from "@/lib/i18n/server";
import { parametrage } from "@/features/parametrage/queries";
import { listerEnseignants } from "@/features/personnel/queries";
import { MatiereForm } from "@/features/parametrage/components/forms";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/data-table";
import { Dialog } from "@/components/ui/dialog";

export default async function ParametrageMatieresPage() {
  const [t, p, enseignants] = await Promise.all([getT(), parametrage(), listerEnseignants()]);
  return (
    <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
      <Card>
        <CardHeader titre={t("Matières et coefficients", "Subjects and coefficients")} sousTitre={t("Les coefficients servent au calcul automatique des moyennes et des rangs.", "Coefficients are used to compute averages and ranks automatically.")} />
        <Table>
          <thead>
            <tr>
              <Th>{t("Code", "Code")}</Th>
              <Th>{t("Matière", "Subject")}</Th>
              <Th>{t("Groupe", "Group")}</Th>
              <Th>{t("Coef. 1er cycle", "Coef. lower")}</Th>
              <Th>{t("Coef. 2nd cycle", "Coef. upper")}</Th>
              <Th>{t("Enseignants", "Teachers")}</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {p.matieres.map((m) => (
              <tr key={m.id}>
                <Td className="font-mono text-xs">{m.code}</Td>
                <Td className="font-semibold">{m.libelle}</Td>
                <Td>{m.groupe}</Td>
                <Td>{m.coefficientPremierCycle || "—"}</Td>
                <Td>{m.coefficientSecondCycle || "—"}</Td>
                <Td className="text-muted">{enseignants.filter((e) => e.specialite === m.libelle).map((e) => e.nom).join(", ") || "—"}</Td>
                <Td className="text-right">
                  <Dialog declencheur={t("Modifier", "Edit")} titre={m.libelle}>
                    <MatiereForm matiere={m} />
                  </Dialog>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
      <Card className="h-fit">
        <CardHeader titre={t("Nouvelle matière", "New subject")} />
        <MatiereForm />
      </Card>
    </div>
  );
}
