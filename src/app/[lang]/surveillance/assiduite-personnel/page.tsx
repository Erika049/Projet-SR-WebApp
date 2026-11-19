// Route : /[lang]/surveillance/assiduite-personnel — Saisie de l'assiduité du personnel (CU-SUR-05) et statistiques (CU-SUR-08).
import { getLang, getT } from "@/lib/i18n/server";
import { dateLongue } from "@/lib/format";
import { FONCTION, lib } from "@/lib/labels";
import { nomCivil } from "@/lib/utils";
import { assiduitePersonnel, presencesPersonnelDuJour } from "@/features/assiduite-personnel/queries";
import { AppelPersonnelForm } from "@/features/assiduite-personnel/components/appel-personnel-form";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";

export default async function AssiduitePersonnelSurveillancePage() {
  const [t, lang, jour, stats] = await Promise.all([getT(), getLang(), presencesPersonnelDuJour(), assiduitePersonnel()]);
  return (
    <>
      <PageHeader titre={t("Assiduité du personnel", "Staff attendance")} sousTitre={dateLongue(jour.date, lang)} />
      <PageBody>
        <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
          <Card>
            <CardHeader titre={t("Saisie du jour", "Today's entry")} sousTitre={t("Signalements des enseignants repris depuis le mobile.", "Teacher reports imported from the mobile app.")} />
            <AppelPersonnelForm
              lignes={jour.lignes.map(({ personnel: p, presence }) => ({
                id: p.id,
                nom: nomCivil(p),
                fonction: `${lib(FONCTION, p.fonction, t)}${p.categorie === "enseignant" ? ` · ${p.specialite}` : ""}`,
                presence,
                conge: p.statut === "conge",
              }))}
            />
          </Card>
          <Card className="h-fit">
            <CardHeader titre={t("Statistiques du mois", "Monthly statistics")} />
            <p className="text-4xl font-bold text-navy-800">{stats.taux} %</p>
            <p className="text-sm text-muted">{t("de présence du personnel", "staff attendance")}</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt>{t("Retards", "Late arrivals")}</dt><dd className="font-semibold">{stats.retards}</dd></div>
              <div className="flex justify-between"><dt>{t("Absences", "Absences")}</dt><dd className="font-semibold">{stats.absences}</dd></div>
              <div className="flex justify-between"><dt>{t("Non justifiées", "Unjustified")}</dt><dd className="font-semibold text-red-600">{stats.nonJustifiees}</dd></div>
            </dl>
            <ButtonLink href={`/api/exports/assiduite-personnel?lang=${lang}`} variante="secondaire" className="mt-5" prefetch={false}>{t("Éditer le rapport", "Export the report")}</ButtonLink>
          </Card>
        </div>
      </PageBody>
    </>
  );
}
