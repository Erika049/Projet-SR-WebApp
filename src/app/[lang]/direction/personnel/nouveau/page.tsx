// Route : /[lang]/direction/personnel/nouveau — Ajouter un membre du personnel (CU-DIR-03).
import { getLang, getT } from "@/lib/i18n/server";
import { ajouterMembre } from "@/features/personnel/actions";
import { ChampsMembre } from "@/features/personnel/components/champs-membre";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Formulaire } from "@/components/ui/formulaire";

export default async function NouveauMembrePage() {
  const [t, lang] = await Promise.all([getT(), getLang()]);
  return (
    <>
      <PageHeader titre={t("Ajouter un membre", "Add a member")} filAriane={[{ href: `/${lang}/direction/personnel`, libelle: t("Personnel", "Staff") }]} />
      <PageBody>
        <Card className="max-w-2xl">
          <Formulaire action={ajouterMembre.bind(null, null)} libelle={t("Créer le compte", "Create account")}>
            <ChampsMembre />
          </Formulaire>
        </Card>
      </PageBody>
    </>
  );
}
