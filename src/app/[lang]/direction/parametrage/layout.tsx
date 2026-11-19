// Paramétrage de l'année (CU-DIR-02) : en-tête commun + onglets.
import { getLang, getT } from "@/lib/i18n/server";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Tabs } from "@/components/ui/tabs";

export default async function ParametrageLayout({ children }: { children: React.ReactNode }) {
  const [t, lang] = await Promise.all([getT(), getLang()]);
  const base = `/${lang}/direction/parametrage`;
  return (
    <>
      <PageHeader
        titre={t("Paramétrage de l'année", "School year settings")}
        sousTitre={t("Tout ce qui définit l'année scolaire se règle ici. Les changements s'appliquent aux mobiles des parents et des enseignants.", "Everything that defines the school year is set here. Changes apply to parents' and teachers' mobile apps.")}
      />
      <PageBody>
        <Tabs
          onglets={[
            { href: base, libelle: t("Année et périodes", "Year and terms") },
            { href: `${base}/classes`, libelle: t("Classes", "Classes") },
            { href: `${base}/matieres`, libelle: t("Matières et coefficients", "Subjects and coefficients") },
            { href: `${base}/calendrier`, libelle: t("Calendrier", "Calendar") },
            { href: `${base}/evaluation`, libelle: t("Évaluation", "Assessment") },
            { href: `${base}/frais`, libelle: t("Frais", "Fees") },
          ]}
        />
        {children}
      </PageBody>
    </>
  );
}
