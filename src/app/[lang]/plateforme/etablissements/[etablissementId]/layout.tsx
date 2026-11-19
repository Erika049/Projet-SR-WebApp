// Fiche d'un établissement (super-admin) : en-tête + onglets Aperçu / Personnel.
import { notFound } from "next/navigation";
import { getLang, getT } from "@/lib/i18n/server";
import { getEtablissement } from "@/lib/api/backend";
import { ApiError } from "@/lib/api/errors";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";

export default async function EtablissementLayout({ children, params }: LayoutProps<"/[lang]/plateforme/etablissements/[etablissementId]">) {
  const [{ etablissementId }, t, lang] = await Promise.all([params, getT(), getLang()]);
  const e = await getEtablissement(etablissementId).catch((err) => {
    if (err instanceof ApiError && (err.status === 404 || err.status === 400)) return null;
    throw err;
  });
  if (!e) notFound();
  const base = `/${lang}/plateforme/etablissements/${e.id}`;
  return (
    <>
      <PageHeader
        titre={e.nom}
        filAriane={[{ href: `/${lang}/plateforme/etablissements`, libelle: t("Établissements", "Schools") }]}
        sousTitre={`${e.code} · ${e.ville ?? "—"} · ${e.sousSysteme.toLowerCase()}`}
        actions={<Badge ton={e.statut === "ACTIF" ? "succes" : "alerte"}>{e.statut.toLowerCase()}</Badge>}
      />
      <PageBody>
        <Tabs
          onglets={[
            { href: base, libelle: t("Aperçu", "Overview") },
            { href: `${base}/utilisateurs`, libelle: t("Personnel", "Staff") },
          ]}
        />
        {children}
      </PageBody>
    </>
  );
}
