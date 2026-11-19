// Route : /[lang]/comptabilite/situation — Recherche d'un élève par nom ou matricule (CU-ECO-01).
import { getT } from "@/lib/i18n/server";
import { texteRecherche } from "@/lib/api/pagination";
import { RechercheEleve } from "@/features/finances/components/recherche-eleve";
import { PageBody, PageHeader } from "@/components/layout/page-header";

export default async function SituationFinancierePage({ searchParams }: PageProps<"/[lang]/comptabilite/situation">) {
  const [sp, t] = await Promise.all([searchParams, getT()]);
  return (
    <>
      <PageHeader titre={t("Situation financière", "Student account")} sousTitre={t("Recherchez un élève par nom ou matricule.", "Search a student by name or ID.")} />
      <PageBody>
        <RechercheEleve q={texteRecherche(sp.q)} lien={(id) => `/comptabilite/situation/${id}`} libelleLien={t("Ouvrir", "Open")} />
      </PageBody>
    </>
  );
}
