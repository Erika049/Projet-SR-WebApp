// Route : /[lang]/direction/notes-bulletins — Résultats par classe (moyennes saisies par les enseignants).
import Link from "next/link";
import { getLang, getT } from "@/lib/i18n/server";
import { classes as lireClasses, resultats } from "@/lib/api/backend";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { LigneVide, Table, Td, Th } from "@/components/ui/data-table";

export default async function NotesPage() {
  const [t, lang, classes] = await Promise.all([getT(), getLang(), lireClasses()]);
  const parClasse = await Promise.all(classes.map(async (c) => ({ c, r: await resultats(c.id) })));
  return (
    <>
      <PageHeader titre={t("Notes et résultats", "Marks and results")} sousTitre={t("Moyennes de l'année calculées à partir des notes saisies par les enseignants.", "Yearly averages computed from the marks entered by teachers.")} />
      <PageBody>
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>{t("Classe", "Class")}</Th>
                <Th>{t("Élèves notés", "Students with marks")}</Th>
                <Th>{t("Matières notées", "Subjects with marks")}</Th>
                <Th>{t("Moyenne de classe", "Class average")}</Th>
                <Th>{t("Réussite (≥ 10)", "Pass rate (≥ 10)")}</Th>
              </tr>
            </thead>
            <tbody>
              {parClasse.length === 0 && <LigneVide colSpan={5} texte={t("Aucune classe.", "No class.")} />}
              {parClasse.map(({ c, r }) => {
                const notes = r.eleves.map((e) => e.moyenneGenerale).filter((m): m is number => m !== null).map(Number);
                const moyenne = notes.length ? notes.reduce((s, m) => s + m, 0) / notes.length : null;
                return (
                  <tr key={c.id}>
                    <Td><Link href={`/${lang}/direction/notes-bulletins/${c.id}`} className="font-semibold text-navy-700 hover:underline">{c.nom}</Link></Td>
                    <Td>{notes.length} / {r.eleves.length}</Td>
                    <Td>{r.matieres.length}</Td>
                    <Td className="font-semibold">{moyenne === null ? "—" : moyenne.toFixed(2)}</Td>
                    <Td>{notes.length ? `${Math.round((notes.filter((m) => m >= 10).length / notes.length) * 100)} %` : "—"}</Td>
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
