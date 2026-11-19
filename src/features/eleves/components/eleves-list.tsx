// Répertoire des élèves de l'année courante (backend : /etablissements/{id}/repertoire-eleves).
// Consultation (direction) ou gestion (secrétariat) ; filtre par classe et recherche par nom ou matricule.
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { getLang, getT } from "@/lib/i18n/server";
import { dateCourte } from "@/lib/format";
import { classes as lireClasses, repertoire } from "@/lib/api/backend";
import { premier } from "@/lib/utils";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LigneVide, Table, Td, Th } from "@/components/ui/data-table";
import { SearchInput } from "@/components/ui/search-input";
import { GrilleStats, StatCard } from "@/components/ui/stat-card";
import { Tabs } from "@/components/ui/tabs";

export async function ElevesList({ espace, searchParams }: { espace: "secretariat" | "direction"; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [sp, t, lang, eleves, classes] = await Promise.all([searchParams, getT(), getLang(), repertoire(), lireClasses()]);
  const q = (premier(sp.q) ?? "").trim().toLowerCase();
  const classe = premier(sp.classe) ?? "";
  const base = `/${lang}/${espace}/eleves`;
  const liste = eleves.filter(
    (e) =>
      (!classe || e.classeId === classe) &&
      (!q || `${e.nom} ${e.prenom} ${e.matricule}`.toLowerCase().includes(q)),
  );
  const lies = eleves.filter((e) => e.liaison === "LIEE").length;
  const LIAISON: Record<string, [string, "succes" | "alerte" | "danger"]> = {
    LIEE: [t("Parent lié", "Parent linked"), "succes"],
    EN_ATTENTE: [t("Demande à valider", "Request pending"), "alerte"],
    NON_LIEE: [t("Aucun parent", "No parent"), "danger"],
  };

  return (
    <>
      <PageHeader
        titre={t("Élèves", "Students")}
        sousTitre={t(`${eleves.length} élèves inscrits cette année`, `${eleves.length} students enrolled this year`)}
        actions={
          espace === "secretariat" ? (
            <Link href={`${base}/nouveau`} className="inline-flex items-center gap-2 rounded-lg bg-navy-700 px-4 py-2 text-sm font-semibold text-white">
              <UserPlus className="size-4" /> {t("Inscrire un élève", "Enrol a student")}
            </Link>
          ) : undefined
        }
      />
      <PageBody>
        <GrilleStats>
          <StatCard libelle={t("Élèves", "Students")} valeur={eleves.length} detail={t(`${classes.length} classes`, `${classes.length} classes`)} />
          <StatCard libelle={t("Filles", "Girls")} valeur={eleves.filter((e) => e.sexe === "F").length} detail={t("Garçons", "Boys") + ` : ${eleves.filter((e) => e.sexe === "M").length}`} />
          <StatCard libelle={t("Parents liés", "Linked parents")} valeur={lies} detail={t("Accès à l'application mobile", "Mobile app access")} ton="succes" />
          <StatCard libelle={t("Sans parent lié", "Without parent")} valeur={eleves.length - lies} detail={t("Code de liaison à remettre", "Link code to hand out")} ton="alerte" />
        </GrilleStats>
        <Tabs
          onglets={[
            { href: base + (q ? `?q=${encodeURIComponent(q)}` : ""), libelle: t("Toutes les classes", "All classes"), compteur: eleves.length },
            ...classes.map((c) => ({
              href: `${base}?classe=${c.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`,
              libelle: c.nom,
              compteur: eleves.filter((e) => e.classeId === c.id).length,
            })),
          ]}
        />
        <Card>
          <div className="mb-4">
            <SearchInput defaut={q} placeholder={t("Nom, prénom ou matricule", "Name or student ID")} conserver={{ classe }} libelleBouton={t("Rechercher", "Search")} />
          </div>
          <Table>
            <thead>
              <tr>
                <Th>{t("Élève", "Student")}</Th>
                <Th>{t("Matricule", "Student ID")}</Th>
                <Th>{t("Classe", "Class")}</Th>
                <Th>{t("Naissance", "Born")}</Th>
                <Th>{t("Accès parent", "Parent access")}</Th>
              </tr>
            </thead>
            <tbody>
              {liste.length === 0 && <LigneVide colSpan={5} texte={t("Aucun élève.", "No students.")} />}
              {liste.map((e) => (
                <tr key={e.eleveId}>
                  <Td>
                    <Link href={`${base}/${e.eleveId}`} className="font-semibold text-navy-700 hover:underline">
                      {e.nom} {e.prenom}
                    </Link>
                  </Td>
                  <Td className="font-mono text-xs">{e.matricule}</Td>
                  <Td>{e.classeNom ?? <span className="text-muted">{t("Non affecté", "Not assigned")}</span>}</Td>
                  <Td className="text-muted">{dateCourte(e.dateNaissance, lang)}</Td>
                  <Td><Badge ton={LIAISON[e.liaison][1]}>{LIAISON[e.liaison][0]}</Badge></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </PageBody>
    </>
  );
}
