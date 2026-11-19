// Route : /[lang]/direction/utilisateurs — Utilisateurs et audit (CU-DIR-03, CU-DIR-10, CU-SYS-04).
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/dal";
import { getLang, getT } from "@/lib/i18n/server";
import { derniereConnexion, jourMois, quand } from "@/lib/format";
import { numeroPage } from "@/lib/api/pagination";
import { FONCTION, STATUT_COMPTE, lib, ton } from "@/lib/labels";
import { nomCivil, premier } from "@/lib/utils";
import { comptesEtablissement, correctionsAValider, journalAudit } from "@/features/audit/queries";
import { traiterCorrection } from "@/features/eleves/actions";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Pagination, Table, Td, Th } from "@/components/ui/data-table";
import { Tabs } from "@/components/ui/tabs";
import { Personne } from "@/components/ui/avatar";
import { ActionButton } from "@/components/ui/action-button";

export default async function UtilisateursAuditPage({ searchParams }: PageProps<"/[lang]/direction/utilisateurs">) {
  const [sp, t, lang, session] = await Promise.all([searchParams, getT(), getLang(), getCurrentUser()]);
  const categorie = premier(sp.categorie);
  const [comptes, journal, corrections] = await Promise.all([comptesEtablissement(categorie), journalAudit(session.etablissementId!, numeroPage(sp.page)), correctionsAValider()]);
  const base = `/${lang}/direction/utilisateurs`;

  return (
    <>
      <PageHeader
        titre={t("Utilisateurs et audit", "Users and audit")}
        sousTitre={t("Chaque action sensible est tracée : qui, quoi, quand.", "Every sensitive action is logged: who, what, when.")}
        actions={<ButtonLink href={`/${lang}/direction/personnel/nouveau`}><UserPlus className="size-4" /> {t("Ajouter un utilisateur", "Add a user")}</ButtonLink>}
      />
      <PageBody>
        {corrections.length > 0 && (
          <Card className="border-sky-200">
            <CardHeader titre={t("Corrections d'identité à valider", "Identity corrections to approve")} sousTitre={t("Demandées par le secrétariat ou par les parents.", "Requested by the secretariat or by parents.")} />
            <Table>
              <thead>
                <tr>
                  <Th>{t("Élève", "Student")}</Th>
                  <Th>{t("Champ", "Field")}</Th>
                  <Th>{t("Ancienne valeur", "Old value")}</Th>
                  <Th>{t("Nouvelle valeur", "New value")}</Th>
                  <Th>{t("Demandé par", "Requested by")}</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {corrections.map((c) => (
                  <tr key={c.id}>
                    <Td><Link href={`/${lang}/direction/eleves/${c.eleveId}`} className="font-semibold hover:underline">{c.eleve.prenom} {c.eleve.nom}</Link> <span className="text-xs text-muted">· {c.eleve.classe.libelle}</span></Td>
                    <Td>{c.champ}</Td>
                    <Td className="text-muted">{c.ancienneValeur}</Td>
                    <Td className="font-semibold">{c.nouvelleValeur}</Td>
                    <Td className="text-muted">{c.demandeur} · {jourMois(c.date, lang)}</Td>
                    <Td>
                      <div className="flex justify-end gap-1.5">
                        <ActionButton action={traiterCorrection.bind(null, c.id, "refuser")} variante="danger">{t("Refuser", "Reject")}</ActionButton>
                        <ActionButton action={traiterCorrection.bind(null, c.id, "accepter")} variante="succes">{t("Valider", "Approve")}</ActionButton>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        )}
        <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
          <Card>
            <CardHeader titre={t("Comptes de l'établissement", "School accounts")} />
            <Tabs
              className="mb-4"
              onglets={[
                { href: base, libelle: t("Tous", "All"), compteur: comptes.compteurs.tous },
                { href: `${base}?categorie=enseignant`, libelle: t("Enseignants", "Teachers"), compteur: comptes.compteurs.enseignant },
                { href: `${base}?categorie=administration`, libelle: t("Administration", "Administration"), compteur: comptes.compteurs.administration },
                { href: `${base}?categorie=surveillance`, libelle: t("Surveillance", "Discipline"), compteur: comptes.compteurs.surveillance },
              ]}
            />
            <Table>
              <thead>
                <tr>
                  <Th>{t("Nom", "Name")}</Th>
                  <Th>{t("Rôle", "Role")}</Th>
                  <Th>{t("Statut", "Status")}</Th>
                  <Th>{t("Dernière connexion", "Last sign-in")}</Th>
                </tr>
              </thead>
              <tbody>
                {comptes.lignes.map((l) => (
                  <tr key={l.personnel.id}>
                    <Td><Link href={`/${lang}/direction/personnel/${l.personnel.id}`} className="hover:underline"><Personne nom={nomCivil(l.personnel)} /></Link></Td>
                    <Td className="text-muted">{lib(FONCTION, l.personnel.fonction, t)}{l.personnel.categorie === "enseignant" ? ` · ${l.personnel.specialite}` : ""}</Td>
                    <Td><Badge ton={ton(STATUT_COMPTE, l.statut)}>{lib(STATUT_COMPTE, l.statut, t)}</Badge></Td>
                    <Td className="text-muted">{derniereConnexion(l.derniereConnexion, lang)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
          <Card className="h-fit">
            <CardHeader titre={t("Journal d'audit", "Audit log")} />
            <ul className="divide-y divide-line">
              {journal.items.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                  <div>
                    <p className="font-semibold">{a.action}</p>
                    <p className="text-muted">{a.acteur}{a.cible ? ` · ${a.cible}` : ""}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted">{quand(a.date, lang)}</span>
                </li>
              ))}
            </ul>
            <Pagination page={journal.page} total={journal.total} taille={journal.taille} base={base} params={{ categorie }} t={t} />
          </Card>
        </div>
      </PageBody>
    </>
  );
}
