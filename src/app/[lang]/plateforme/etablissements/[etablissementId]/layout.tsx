// Fiche d'un établissement (super-admin) : en-tête + onglets Aperçu / Abonnement / Utilisateurs / Activité.
import { notFound } from "next/navigation";
import { getLang, getT } from "@/lib/i18n/server";
import { SOUS_SYSTEME, STATUT_ETABLISSEMENT, lib, ton } from "@/lib/labels";
import { getEtablissement } from "@/features/plateforme/queries";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";

export default async function EtablissementLayout({ children, params }: LayoutProps<"/[lang]/plateforme/etablissements/[etablissementId]">) {
  const [{ etablissementId }, t, lang] = await Promise.all([params, getT(), getLang()]);
  const e = await getEtablissement(etablissementId);
  if (!e) notFound();
  const base = `/${lang}/plateforme/etablissements/${e.id}`;
  return (
    <>
      <PageHeader
        titre={e.nom}
        filAriane={[{ href: `/${lang}/plateforme/etablissements`, libelle: t("Établissements", "Schools") }]}
        sousTitre={`${e.code} · ${e.ville} · ${lib(SOUS_SYSTEME, e.sousSysteme, t)}`}
        actions={<Badge ton={ton(STATUT_ETABLISSEMENT, e.statut)}>{lib(STATUT_ETABLISSEMENT, e.statut, t)}</Badge>}
      />
      <PageBody>
        <Tabs
          onglets={[
            { href: base, libelle: t("Aperçu", "Overview") },
            { href: `${base}/abonnement`, libelle: t("Abonnement", "Subscription") },
            { href: `${base}/utilisateurs`, libelle: t("Utilisateurs", "Users"), compteur: e.utilisateurs.length },
            { href: `${base}/activite`, libelle: t("Activité", "Activity") },
          ]}
        />
        {children}
      </PageBody>
    </>
  );
}
