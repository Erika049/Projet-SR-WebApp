// Route : /[lang]/direction/personnel — Personnel (CU-DIR-03, CU-SEC-09).
import Link from "next/link";
import { Briefcase, ShieldCheck, UserPlus, Users } from "lucide-react";
import { getLang, getT } from "@/lib/i18n/server";
import { numeroPage, texteRecherche } from "@/lib/api/pagination";
import { FONCTION, STATUT_COMPTE, lib, ton } from "@/lib/labels";
import { nomCivil, premier } from "@/lib/utils";
import { listerPersonnel } from "@/features/personnel/queries";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { GrilleStats, StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { LigneVide, Pagination, Table, Td, Th } from "@/components/ui/data-table";
import { Tabs } from "@/components/ui/tabs";
import { Personne } from "@/components/ui/avatar";
import { SearchInput } from "@/components/ui/search-input";

export default async function PersonnelPage({ searchParams }: PageProps<"/[lang]/direction/personnel">) {
  const [sp, t, lang] = await Promise.all([searchParams, getT(), getLang()]);
  const categorie = premier(sp.categorie);
  const q = texteRecherche(sp.q);
  const p = await listerPersonnel({ categorie, q, page: numeroPage(sp.page) });
  const base = `/${lang}/direction/personnel`;
  return (
    <>
      <PageHeader
        titre={t("Personnel", "Staff")}
        sousTitre={t(`${p.compteurs.tous} membres du personnel · Année 2026-2027`, `${p.compteurs.tous} staff members · Year 2026-2027`)}
        actions={
          <>
            <ButtonLink href={`/api/exports/personnel?lang=${lang}`} variante="secondaire" prefetch={false}>{t("Exporter", "Export")}</ButtonLink>
            <ButtonLink href={`${base}/nouveau`}><UserPlus className="size-4" /> {t("Ajouter un membre", "Add a member")}</ButtonLink>
          </>
        }
      />
      <PageBody>
        <GrilleStats>
          <StatCard libelle={t("Personnel", "Staff")} valeur={p.compteurs.tous} detail={t("Tous rôles confondus", "All roles")} icone={<Users className="size-5" />} />
          <StatCard libelle={t("Enseignants", "Teachers")} valeur={p.compteurs.enseignant} detail={t(`${p.compteurs.matieres} matières`, `${p.compteurs.matieres} subjects`)} icone={<Briefcase className="size-5" />} ton="succes" />
          <StatCard libelle={t("Administration", "Administration")} valeur={p.compteurs.administration} detail={t("Direction, secrétariat, comptabilité", "Management, secretariat, accounting")} icone={<ShieldCheck className="size-5" />} />
          <StatCard libelle={t("Surveillance", "Discipline")} valeur={p.compteurs.surveillance} detail={t("Surveillants et surveillant général", "Supervisors and head of discipline")} icone={<ShieldCheck className="size-5" />} ton="alerte" />
        </GrilleStats>
        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Tabs
              onglets={[
                { href: base, libelle: t("Tous", "All"), compteur: p.compteurs.tous },
                { href: `${base}?categorie=enseignant`, libelle: t("Enseignants", "Teachers"), compteur: p.compteurs.enseignant },
                { href: `${base}?categorie=administration`, libelle: t("Administration", "Administration"), compteur: p.compteurs.administration },
                { href: `${base}?categorie=surveillance`, libelle: t("Surveillance", "Discipline"), compteur: p.compteurs.surveillance },
              ]}
            />
            <SearchInput defaut={q} placeholder={t("Nom, matricule, matière…", "Name, ID, subject…")} conserver={{ categorie }} libelleBouton={t("Rechercher", "Search")} />
          </div>
          <Table>
            <thead>
              <tr>
                <Th>{t("Matricule", "ID")}</Th>
                <Th>{t("Nom", "Name")}</Th>
                <Th>{t("Fonction", "Role")}</Th>
                <Th>{t("Spécialité", "Specialty")}</Th>
                <Th>{t("Classes", "Classes")}</Th>
                <Th>{t("Statut", "Status")}</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {p.items.length === 0 && <LigneVide colSpan={7} texte={t("Aucun résultat.", "No results.")} />}
              {p.items.map((m) => (
                <tr key={m.id}>
                  <Td className="font-mono text-xs">{m.matricule}</Td>
                  <Td><Personne nom={nomCivil(m)} /></Td>
                  <Td>{lib(FONCTION, m.fonction, t)}</Td>
                  <Td className="text-muted">{m.specialite}</Td>
                  <Td className="text-muted">{m.fonction === "surveillant_general" ? t("Toutes les classes", "All classes") : m.classes.join(", ") || "—"}</Td>
                  <Td><Badge ton={ton(STATUT_COMPTE, m.statut)}>{lib(STATUT_COMPTE, m.statut, t)}</Badge></Td>
                  <Td className="text-right">
                    <Link href={`${base}/${m.id}`} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-navy-700 hover:bg-navy-50">
                      {t("Voir la fiche", "View profile")}
                    </Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={p.page} total={p.total} taille={p.taille} base={base} params={{ categorie, q: q || undefined }} t={t} />
        </Card>
      </PageBody>
    </>
  );
}
