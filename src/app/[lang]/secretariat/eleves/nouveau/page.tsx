// Route : /[lang]/secretariat/eleves/nouveau — Inscrire un élève (CU-SEC-01, CU-SEC-04).
import { getLang, getT } from "@/lib/i18n/server";
import { listerClasses } from "@/features/parametrage/queries";
import { InscriptionForm } from "@/features/eleves/components/inscription-form";
import { PageBody, PageHeader } from "@/components/layout/page-header";

export default async function InscrireElevePage() {
  const [t, lang, classes] = await Promise.all([getT(), getLang(), listerClasses()]);
  return (
    <>
      <PageHeader titre={t("Inscrire un élève", "Enrol a student")} filAriane={[{ href: `/${lang}/secretariat/eleves`, libelle: t("Élèves", "Students") }]} sousTitre={t("Un doublon (même nom, prénom et date de naissance) est détecté automatiquement.", "Duplicates (same names and date of birth) are detected automatically.")} />
      <PageBody>
        <InscriptionForm classes={classes.map((c) => ({ id: c.id, libelle: c.libelle, places: Math.max(0, c.capacite - c.effectif) }))} />
      </PageBody>
    </>
  );
}
