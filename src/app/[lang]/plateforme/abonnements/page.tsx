// Route : /[lang]/plateforme/abonnements — Suivi des plans, dates de fin et renouvellements (CU-SAD-03).
import Link from "next/link";
import { getLang, getT } from "@/lib/i18n/server";
import { dateCourte, millions } from "@/lib/format";
import { numeroPage } from "@/lib/api/pagination";
import { PLAN, lib, ton } from "@/lib/labels";
import { premier } from "@/lib/utils";
import { abonnements } from "@/features/plateforme/queries";
import { prolongerAbonnement } from "@/features/plateforme/actions";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge, type Ton } from "@/components/ui/badge";
import { Pagination, Table, Td, Th } from "@/components/ui/data-table";
import { GrilleStats, StatCard } from "@/components/ui/stat-card";
import { Tabs } from "@/components/ui/tabs";
import { ActionButton } from "@/components/ui/action-button";

export default async function AbonnementsPage({ searchParams }: PageProps<"/[lang]/plateforme/abonnements">) {
  const [sp, t, lang] = await Promise.all([searchParams, getT(), getLang()]);
  const filtre = premier(sp.filtre);
  const a = await abonnements({ filtre, page: numeroPage(sp.page) });
  const base = `/${lang}/plateforme/abonnements`;
  const statuts: Record<string, [string, Ton]> = {
    actif: [t("Actif", "Active"), "succes"],
    a_renouveler: [t("À renouveler", "To renew"), "alerte"],
    essai: [t("En essai", "Trial"), "info"],
    expire: [t("Expiré", "Expired"), "danger"],
    suspendu: [t("Suspendu", "Suspended"), "danger"],
  };
  return (
    <>
      <PageHeader titre={t("Abonnements", "Subscriptions")} sousTitre={t("Suivi des plans, des dates de fin et des renouvellements", "Plans, end dates and renewals")} />
      <PageBody>
        <GrilleStats>
          <StatCard libelle={t("Abonnements actifs", "Active subscriptions")} valeur={a.actifs} detail={t(`sur ${a.total} établissements`, `of ${a.total} schools`)} ton="succes" />
          <StatCard libelle={t("À renouveler", "To renew")} valeur={a.aRenouveler} detail={t("dans les 30 jours", "within 30 days")} ton="alerte" />
          <StatCard libelle={t("Expirés / suspendus", "Expired / suspended")} valeur={a.bloques} detail={t("accès bloqué", "access blocked")} ton="danger" />
          <StatCard libelle={t("Revenu annuel", "Annual revenue")} valeur={millions(a.revenuAnnuel, lang)} detail="FCFA" />
        </GrilleStats>
        <Card>
          <Tabs
            className="mb-4"
            onglets={[
              { href: base, libelle: t("Tous", "All") },
              { href: `${base}?filtre=a_renouveler`, libelle: t("À renouveler", "To renew") },
              { href: `${base}?filtre=essai`, libelle: t("En essai", "Trial") },
              { href: `${base}?filtre=expire`, libelle: t("Expirés", "Expired") },
              { href: `${base}?filtre=suspendu`, libelle: t("Suspendus", "Suspended") },
            ]}
          />
          <Table>
            <thead>
              <tr>
                <Th>{t("Établissement", "School")}</Th>
                <Th>Plan</Th>
                <Th>{t("Début", "Start")}</Th>
                <Th>{t("Fin", "End")}</Th>
                <Th>{t("Statut", "Status")}</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {a.items.map((e) => (
                <tr key={e.id}>
                  <Td><Link href={`/${lang}/plateforme/etablissements/${e.id}`} className="font-semibold hover:underline">{e.nom}</Link></Td>
                  <Td><Badge ton={ton(PLAN, e.plan)}>{lib(PLAN, e.plan, t)}</Badge></Td>
                  <Td>{dateCourte(e.debutAbonnement, lang)}</Td>
                  <Td>{dateCourte(e.finAbonnement, lang)}</Td>
                  <Td><Badge ton={statuts[e.statutAbonnement][1]}>{statuts[e.statutAbonnement][0]}</Badge></Td>
                  <Td className="text-right">
                    <ActionButton action={prolongerAbonnement.bind(null, e.id)} champs={{ mois: "12" }}>
                      {e.plan === "essai" ? t("Convertir", "Convert") : t("Prolonger", "Extend")}
                    </ActionButton>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={a.page} total={a.total} taille={a.taille} base={base} params={{ filtre }} t={t} />
        </Card>
      </PageBody>
    </>
  );
}
