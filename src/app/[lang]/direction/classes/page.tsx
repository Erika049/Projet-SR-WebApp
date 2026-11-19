// Route : /[lang]/direction/classes — Classes de l'année courante et effectifs.
import Link from "next/link";
import { getLang, getT } from "@/lib/i18n/server";
import { affectations as lireAffectations, classes as lireClasses, repertoire } from "@/lib/api/backend";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { LigneVide, Table, Td, Th } from "@/components/ui/data-table";

export default async function ClassesPage() {
  const [t, lang, classes, eleves, affectations] = await Promise.all([getT(), getLang(), lireClasses(), repertoire(), lireAffectations()]);
  return (
    <>
      <PageHeader titre={t("Classes", "Classes")} sousTitre={t(`${classes.length} classes · ${eleves.length} élèves`, `${classes.length} classes · ${eleves.length} students`)} />
      <PageBody>
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>{t("Classe", "Class")}</Th>
                <Th>{t("Niveau", "Level")}</Th>
                <Th>{t("Effectif", "Students")}</Th>
                <Th>{t("Enseignants", "Teachers")}</Th>
              </tr>
            </thead>
            <tbody>
              {classes.length === 0 && <LigneVide colSpan={4} texte={t("Aucune classe.", "No class.")} />}
              {classes.map((c) => {
                const profs = [...new Set(affectations.filter((a) => a.classeId === c.id).map((a) => a.enseignantNom))];
                return (
                  <tr key={c.id}>
                    <Td><Link href={`/${lang}/direction/classes/${c.id}`} className="font-semibold text-navy-700 hover:underline">{c.nom}</Link></Td>
                    <Td>{c.niveau}</Td>
                    <Td>{eleves.filter((e) => e.classeId === c.id).length}{c.effectifMax ? ` / ${c.effectifMax}` : ""}</Td>
                    <Td className="text-muted">{profs.join(", ") || "—"}</Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      </PageBody>
    </>
  );
}
