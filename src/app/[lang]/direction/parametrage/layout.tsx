// Paramétrage de l'année (CU-DIR-02) : en-tête commun + onglets. Toutes les données viennent du backend.
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
        sousTitre={t("Année scolaire, périodes, classes, matières et emploi du temps. Les changements s'appliquent aussitôt aux applications mobiles.", "School year, terms, classes, subjects and timetable. Changes apply at once to the mobile apps.")}
      />
      <PageBody>
        <Tabs
          onglets={[
            { href: base, libelle: t("Année et périodes", "Year and terms") },
            { href: `${base}/classes`, libelle: t("Classes", "Classes") },
            { href: `${base}/matieres`, libelle: t("Matières et coefficients", "Subjects and coefficients") },
            { href: `${base}/emploi-du-temps`, libelle: t("Emploi du temps", "Timetable") },
          ]}
        />
        {children}
      </PageBody>
    </>
  );
}
