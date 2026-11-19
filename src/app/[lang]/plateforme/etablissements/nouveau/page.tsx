// Route : /[lang]/plateforme/etablissements/nouveau — Créer un établissement (CU-SAD-01, CU-SAD-02).
import { getLang, getT } from "@/lib/i18n/server";
import { prochainCode } from "@/features/plateforme/queries";
import { EtablissementWizard } from "@/features/plateforme/components/etablissement-wizard";
import { PageBody, PageHeader } from "@/components/layout/page-header";

export default async function CreerEtablissementPage() {
  const [t, lang, code] = await Promise.all([getT(), getLang(), prochainCode()]);
  return (
    <>
      <PageHeader titre={t("Créer un établissement", "Create a school")} filAriane={[{ href: `/${lang}/plateforme/etablissements`, libelle: t("Établissements", "Schools") }]} sousTitre={t("Espace isolé : les données de chaque école restent séparées.", "Isolated space: each school's data stays separate.")} />
      <PageBody>
        <EtablissementWizard code={code} />
      </PageBody>
    </>
  );
}
