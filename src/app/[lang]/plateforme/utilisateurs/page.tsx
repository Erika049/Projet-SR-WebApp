// Route : /[lang]/plateforme/utilisateurs — Comptes de la plateforme et des directeurs + journal d'audit (CU-SAD-06, CU-SYS-04).
import { getLang, getT } from "@/lib/i18n/server";
import { derniereConnexion, heure, jourMois } from "@/lib/format";
import { numeroPage } from "@/lib/api/pagination";
import { STATUT_COMPTE, lib, ton } from "@/lib/labels";
import { comptesPlateforme, journalPlateforme } from "@/features/plateforme/queries";
import { actionCompte } from "@/features/plateforme/actions";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pagination, Table, Td, Th } from "@/components/ui/data-table";
import { Personne } from "@/components/ui/avatar";
import { ActionButton } from "@/components/ui/action-button";

export default async function UtilisateursPlateformePage({ searchParams }: PageProps<"/[lang]/plateforme/utilisateurs">) {
  const [sp, t, lang] = await Promise.all([searchParams, getT(), getLang()]);
  const [comptes, journal] = await Promise.all([comptesPlateforme(), journalPlateforme(numeroPage(sp.page))]);
  return (
    <>
      <PageHeader titre={t("Utilisateurs et audit", "Users and audit")} sousTitre={t("Comptes de la plateforme et des directeurs", "Platform and principal accounts")} />
      <PageBody>
        <Card>
          <CardHeader titre={t("Comptes", "Accounts")} />
          <Table>
            <thead>
              <tr>
                <Th>{t("Utilisateur", "User")}</Th>
                <Th>{t("Rôle", "Role")}</Th>
                <Th>{t("École", "School")}</Th>
                <Th>{t("Statut", "Status")}</Th>
                <Th>{t("Dernière connexion", "Last sign-in")}</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {comptes.map((u) => (
                <tr key={u.id}>
                  <Td><Personne nom={`${u.civilite} ${u.prenom} ${u.nom}`} detail={u.email} /></Td>
                  <Td>{u.role === "super_admin" ? t("Agent de support", "Support agent") : u.civilite === "Mme" ? t("Directrice", "Principal") : t("Directeur", "Principal")}</Td>
                  <Td className="text-muted">{u.etablissement?.nom ?? t("Plateforme", "Platform")}</Td>
                  <Td><Badge ton={ton(STATUT_COMPTE, u.statut)}>{lib(STATUT_COMPTE, u.statut, t)}</Badge></Td>
                  <Td className="text-muted">{derniereConnexion(u.derniereConnexion, lang)}</Td>
                  <Td className="text-right">
                    {u.statut === "verrouille" ? (
                      <ActionButton action={actionCompte.bind(null, u.id, "deverrouiller")} variante="succes">{t("Déverrouiller", "Unlock")}</ActionButton>
                    ) : u.statut === "invite" ? (
                      <ActionButton action={actionCompte.bind(null, u.id, "renvoyer")}>{t("Renvoyer", "Resend")}</ActionButton>
                    ) : (
                      <ActionButton action={actionCompte.bind(null, u.id, "reinitialiser")}>{t("Réinitialiser", "Reset")}</ActionButton>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <Card>
          <CardHeader titre={t("Journal d'audit de la plateforme", "Platform audit log")} />
          <Table>
            <thead>
              <tr>
                <Th>{t("Date", "Date")}</Th>
                <Th>{t("Agent", "Agent")}</Th>
                <Th>{t("Action", "Action")}</Th>
                <Th>{t("Cible", "Target")}</Th>
              </tr>
            </thead>
            <tbody>
              {journal.items.map((a) => (
                <tr key={a.id}>
                  <Td className="whitespace-nowrap">{jourMois(a.date, lang)} · {heure(a.date)}</Td>
                  <Td>{a.acteur}</Td>
                  <Td className="font-semibold">{a.action}</Td>
                  <Td className="text-muted">{a.cible}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={journal.page} total={journal.total} taille={journal.taille} base={`/${lang}/plateforme/utilisateurs`} t={t} />
        </Card>
      </PageBody>
    </>
  );
}
