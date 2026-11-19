// Route : /[lang]/direction/parametrage/frais — Résumé des frais de l'année ; l'édition se fait dans « Tarifs » (CU-DIR-04).
import { getLang, getT } from "@/lib/i18n/server";
import { fcfa } from "@/lib/format";
import { grilleTarifaire } from "@/features/finances/queries";
import { Card, CardHeader } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Table, Td, Th } from "@/components/ui/data-table";

export default async function ParametrageFraisPage() {
  const [t, lang, g] = await Promise.all([getT(), getLang(), grilleTarifaire()]);
  return (
    <Card>
      <CardHeader
        titre={t("Frais de scolarité", "Tuition fees")}
        sousTitre={t("Montants annuels par niveau et nombre de versements.", "Annual amounts per level and number of instalments.")}
        action={<ButtonLink href={`/${lang}/direction/tarifs`}>{t("Modifier la grille tarifaire", "Edit fee schedule")}</ButtonLink>}
      />
      <Table>
        <thead>
          <tr>
            <Th>{t("Niveau", "Level")}</Th>
            <Th>{t("Frais annuels", "Annual fees")}</Th>
            <Th>{t("Versements", "Instalments")}</Th>
            <Th>{t("Élèves", "Students")}</Th>
            <Th>{t("Montant attendu", "Expected amount")}</Th>
          </tr>
        </thead>
        <tbody>
          {g.tarifs.map((x) => (
            <tr key={x.niveau}>
              <Td className="font-semibold">{x.niveau}</Td>
              <Td>{fcfa(x.montant, lang)}</Td>
              <Td>{x.versements.length}</Td>
              <Td>{x.eleves}</Td>
              <Td className="font-semibold">{fcfa(x.montant * x.eleves, lang)}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
