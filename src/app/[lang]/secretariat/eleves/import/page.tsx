// Route : /[lang]/secretariat/eleves/import — Importer des élèves (CU-SEC-07).
import { getLang, getT } from "@/lib/i18n/server";
import { ImportForm } from "@/features/eleves/components/import-form";
import { PageBody, PageHeader } from "@/components/layout/page-header";

export default async function ImporterElevesPage() {
  const [t, lang] = await Promise.all([getT(), getLang()]);
  return (
    <>
      <PageHeader titre={t("Importer des élèves", "Import students")} filAriane={[{ href: `/${lang}/secretariat/eleves`, libelle: t("Élèves", "Students") }]} sousTitre={t("Fichier Excel enregistré en CSV.", "Excel file saved as CSV.")} />
      <PageBody>
        <ImportForm />
      </PageBody>
    </>
  );
}
