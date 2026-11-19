// Route : /[lang]/direction/tarifs — Frais de scolarité par niveau et échéance (CU-DIR-04).
import { getLang, getT } from "@/lib/i18n/server";
import { dateCourte, fcfa } from "@/lib/format";
import { anneeCourante, classes as lireClasses, frais as lireFrais } from "@/lib/api/backend";
import { creerFrais } from "@/features/parametrage/actions";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LigneVide, Table, Td, Th } from "@/components/ui/data-table";
import { Field, Input, Select } from "@/components/ui/form-field";
import { Formulaire } from "@/components/ui/formulaire";

export default async function TarifsPage() {
  const [t, lang, annee, classes] = await Promise.all([getT(), getLang(), anneeCourante(), lireClasses()]);
  const frais = annee ? await lireFrais(annee.id) : [];
  const niveaux = [...new Set([...classes.map((c) => c.niveau), ...frais.map((f) => f.niveau)])].sort();
  return (
    <>
      <PageHeader titre={t("Frais de scolarité", "School fees")} sousTitre={annee ? t(`Année ${annee.libelle} · appliqués aux élèves selon le niveau de leur classe`, `Year ${annee.libelle} · applied to students by class level`) : undefined} />
      <PageBody>
        {!annee ? (
          <EmptyState titre={t("Aucune année scolaire courante", "No current school year")} />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
            <div className="space-y-6">
              {niveaux.length === 0 && <EmptyState titre={t("Aucun frais défini", "No fee defined")} />}
              {niveaux.map((n) => {
                const lignes = frais.filter((f) => f.niveau === n).sort((a, b) => a.dateEcheance.localeCompare(b.dateEcheance));
                const total = lignes.reduce((s, f) => s + Number(f.montant), 0);
                return (
                  <Card key={n}>
                    <CardHeader titre={t(`Niveau ${n}`, `Level ${n}`)} sousTitre={t(`Total annuel : ${fcfa(total, lang)}`, `Yearly total: ${fcfa(total, lang)}`)} />
                    <Table>
                      <thead><tr><Th>{t("Libellé", "Label")}</Th><Th>{t("Montant", "Amount")}</Th><Th>{t("Échéance", "Due date")}</Th></tr></thead>
                      <tbody>
                        {lignes.length === 0 && <LigneVide colSpan={3} texte={t("Aucun frais pour ce niveau.", "No fee for this level.")} />}
                        {lignes.map((f) => (
                          <tr key={f.id}><Td className="font-semibold">{f.libelle}</Td><Td>{fcfa(Number(f.montant), lang)}</Td><Td className="text-muted">{dateCourte(f.dateEcheance, lang)}</Td></tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card>
                );
              })}
            </div>
            <Card className="h-fit">
              <CardHeader titre={t("Ajouter un versement", "Add an instalment")} />
              <Formulaire action={creerFrais.bind(null, annee.id)} libelle={t("Enregistrer", "Save")}>
                <Field label={t("Niveau", "Level")}><Select name="niveau" options={niveaux.map((n) => ({ value: n, label: n }))} /></Field>
                <Field label={t("Libellé", "Label")}><Input name="libelle" placeholder={t("1re tranche", "1st instalment")} required /></Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label={t("Montant (FCFA)", "Amount (FCFA)")}><Input name="montant" inputMode="numeric" required /></Field>
                  <Field label={t("Échéance", "Due date")}><Input type="date" name="dateEcheance" required /></Field>
                </div>
              </Formulaire>
            </Card>
          </div>
        )}
      </PageBody>
    </>
  );
}
