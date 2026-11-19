// Route : /[lang]/direction/eleves — Liste des élèves (consultation). Inscriptions et corrections : secrétariat.
import { GraduationCap, Link2, School, Repeat } from "lucide-react";
import { getLang, getT } from "@/lib/i18n/server";
import { nombre, pourcent } from "@/lib/format";
import { statsEleves } from "@/features/eleves/queries";
import { ElevesList } from "@/features/eleves/components/eleves-list";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { GrilleStats, StatCard } from "@/components/ui/stat-card";
import { ButtonLink } from "@/components/ui/button";

export default async function ListeElevesPage({ searchParams }: PageProps<"/[lang]/direction/eleves">) {
  const [sp, t, lang, s] = await Promise.all([searchParams, getT(), getLang(), statsEleves()]);
  return (
    <>
      <PageHeader
        titre={t("Liste des élèves", "Student list")}
        sousTitre={t("La direction consulte tous les dossiers. Les inscriptions et corrections sont faites par le secrétariat.", "Management views all files. Enrolments and corrections are made by the secretariat.")}
        actions={<ButtonLink href={`/api/exports/eleves?lang=${lang}`} variante="secondaire" prefetch={false}>{t("Exporter", "Export")}</ButtonLink>}
      />
      <PageBody>
        <GrilleStats>
          <StatCard libelle={t("Élèves inscrits", "Enrolled students")} valeur={nombre(s.total, lang)} detail={`${t("Année", "Year")} 2026-2027`} icone={<GraduationCap className="size-5" />} />
          <StatCard libelle={t("Classes", "Classes")} valeur={s.classes} detail={t(`Moyenne : ${Math.round(s.total / Math.max(1, s.classes))} élèves`, `Average: ${Math.round(s.total / Math.max(1, s.classes))} students`)} icone={<School className="size-5" />} />
          <StatCard libelle={t("Accès parent actifs", "Active parent access")} valeur={pourcent((s.lies / Math.max(1, s.total)) * 100, lang)} detail={t(`${s.lies} élèves liés`, `${s.lies} linked students`)} icone={<Link2 className="size-5" />} ton="succes" />
          <StatCard libelle={t("Redoublants", "Repeating")} valeur={s.redoublants} detail={t(`${Math.round((s.redoublants / Math.max(1, s.total)) * 100)} % des effectifs`, `${Math.round((s.redoublants / Math.max(1, s.total)) * 100)}% of students`)} icone={<Repeat className="size-5" />} ton="alerte" />
        </GrilleStats>
        <ElevesList sp={sp} espace="direction" />
      </PageBody>
    </>
  );
}
