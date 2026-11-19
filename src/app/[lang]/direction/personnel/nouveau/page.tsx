// Route : /[lang]/direction/personnel/nouveau — Ajouter un membre du personnel (CU-DIR-03).
import { getLang, getT } from "@/lib/i18n/server";
import { listerClasses, parametrage } from "@/features/parametrage/queries";
import { prochainMatricule } from "@/features/personnel/queries";
import { MembreForm } from "@/features/personnel/components/membre-form";
import { PageBody, PageHeader } from "@/components/layout/page-header";

export default async function AjouterMembrePage() {
  const [t, lang, classes, p, matricule] = await Promise.all([getT(), getLang(), listerClasses(), parametrage(), prochainMatricule()]);
  return (
    <>
      <PageHeader
        titre={t("Ajouter un membre du personnel", "Add a staff member")}
        filAriane={[{ href: `/${lang}/direction/personnel`, libelle: t("Personnel", "Staff") }]}
        sousTitre={t("Les champs d'identité et la fonction sont obligatoires.", "Identity fields and role are required.")}
      />
      <PageBody>
        <MembreForm classes={classes.map((c) => ({ id: c.id, libelle: c.libelle }))} matieres={p.matieres.map((m) => m.libelle)} matricule={matricule} />
      </PageBody>
    </>
  );
}
