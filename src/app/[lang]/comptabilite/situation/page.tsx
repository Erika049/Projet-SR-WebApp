// Route : /[lang]/comptabilite/situation — Recherche d'un élève pour consulter sa situation financière (CU-ECO-01).
import { getLang, getT } from "@/lib/i18n/server";
import { premier } from "@/lib/utils";
import { RechercheEleve } from "@/features/finances/components/recherche-eleve";
import { PageBody, PageHeader } from "@/components/layout/page-header";

export default async function SituationRecherchePage({ searchParams }: PageProps<"/[lang]/comptabilite/situation">) {
  const [sp, t, lang] = await Promise.all([searchParams, getT(), getLang()]);
  return (
    <>
      <PageHeader titre={t("Situation élève", "Student account")} />
      <PageBody>
        <RechercheEleve q={premier(sp.q) ?? ""} lien={(id) => `/${lang}/comptabilite/situation/${id}`} />
      </PageBody>
    </>
  );
}
