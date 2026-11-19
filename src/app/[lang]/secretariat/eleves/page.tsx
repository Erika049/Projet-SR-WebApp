// Route : /[lang]/secretariat/eleves — Élèves (CU-SEC-01, CU-SEC-03).
import { Upload, UserPlus, RefreshCw } from "lucide-react";
import { getLang, getT } from "@/lib/i18n/server";
import { statsEleves } from "@/features/eleves/queries";
import { ElevesList } from "@/features/eleves/components/eleves-list";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";

export default async function ElevesSecretariatPage({ searchParams }: PageProps<"/[lang]/secretariat/eleves">) {
  const [sp, t, lang, s] = await Promise.all([searchParams, getT(), getLang(), statsEleves()]);
  const base = `/${lang}/secretariat/eleves`;
  return (
    <>
      <PageHeader
        titre={t("Élèves", "Students")}
        sousTitre={t(`${s.total} élèves · ${s.incomplets} dossiers incomplets`, `${s.total} students · ${s.incomplets} incomplete files`)}
        actions={
          <>
            <ButtonLink href={`${base}/reinscriptions`} variante="secondaire"><RefreshCw className="size-4" /> {t("Réinscriptions", "Re-enrolments")}</ButtonLink>
            <ButtonLink href={`${base}/import`} variante="secondaire"><Upload className="size-4" /> {t("Importer", "Import")}</ButtonLink>
            <ButtonLink href={`${base}/nouveau`}><UserPlus className="size-4" /> {t("Inscrire un élève", "Enrol a student")}</ButtonLink>
          </>
        }
      />
      <PageBody>
        <ElevesList sp={sp} espace="secretariat" />
      </PageBody>
    </>
  );
}
