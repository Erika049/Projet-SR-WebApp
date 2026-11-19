// Route : /[lang]/direction/classes/[classeId] — Détail d'une classe : élèves, équipe pédagogique, emploi du temps.
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLang, getT } from "@/lib/i18n/server";
import { affectations as lireAffectations, classes as lireClasses, creneauxClasse, repertoire } from "@/lib/api/backend";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LigneVide, Table, Td, Th } from "@/components/ui/data-table";

const JOURS = ["", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export default async function ClassePage({ params }: PageProps<"/[lang]/direction/classes/[classeId]">) {
  const [{ classeId }, t, lang] = await Promise.all([params, getT(), getLang()]);
  const classe = (await lireClasses()).find((c) => c.id === classeId);
  if (!classe) notFound();
  const [eleves, affectations, creneaux] = await Promise.all([repertoire(), lireAffectations(), creneauxClasse(classeId)]);
  const liste = eleves.filter((e) => e.classeId === classeId);
  const equipe = affectations.filter((a) => a.classeId === classeId);
  return (
    <>
      <PageHeader titre={classe.nom} filAriane={[{ href: `/${lang}/direction/classes`, libelle: t("Classes", "Classes") }]} sousTitre={t(`Niveau ${classe.niveau} · ${liste.length} élèves`, `Level ${classe.niveau} · ${liste.length} students`)} />
      <PageBody>
        <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
          <Card>
            <CardHeader titre={t("Élèves", "Students")} action={<Link href={`/${lang}/direction/notes-bulletins/${classeId}`} className="text-sm font-semibold text-navy-700 hover:underline">{t("Résultats →", "Results →")}</Link>} />
            <Table>
              <thead><tr><Th>{t("Élève", "Student")}</Th><Th>{t("Matricule", "Student ID")}</Th><Th>{t("Accès parent", "Parent access")}</Th></tr></thead>
              <tbody>
                {liste.length === 0 && <LigneVide colSpan={3} texte={t("Aucun élève.", "No student.")} />}
                {liste.map((e) => (
                  <tr key={e.eleveId}>
                    <Td><Link href={`/${lang}/direction/eleves/${e.eleveId}`} className="font-semibold text-navy-700 hover:underline">{e.nom} {e.prenom}</Link></Td>
                    <Td className="font-mono text-xs">{e.matricule}</Td>
                    <Td><Badge ton={e.liaison === "LIEE" ? "succes" : e.liaison === "EN_ATTENTE" ? "alerte" : "danger"}>{e.liaison === "LIEE" ? t("Lié", "Linked") : e.liaison === "EN_ATTENTE" ? t("En attente", "Pending") : t("Aucun", "None")}</Badge></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
          <div className="space-y-6">
            <Card>
              <CardHeader titre={t("Équipe pédagogique", "Teaching team")} />
              {equipe.length === 0 ? (
                <EmptyState titre={t("Aucun enseignant affecté", "No teacher assigned")} />
              ) : (
                <ul className="divide-y divide-line text-sm">
                  {equipe.map((a) => (
                    <li key={a.id} className="flex justify-between py-2"><span className="font-semibold">{a.matiereNom}</span><span className="text-muted">{a.enseignantNom}</span></li>
                  ))}
                </ul>
              )}
            </Card>
            <Card>
              <CardHeader titre={t("Emploi du temps", "Timetable")} action={<Link href={`/${lang}/direction/parametrage/emploi-du-temps?classe=${classeId}`} className="text-sm font-semibold text-navy-700 hover:underline">{t("Modifier", "Edit")}</Link>} />
              {creneaux.length === 0 ? (
                <EmptyState titre={t("Aucun cours", "No lesson")} />
              ) : (
                <ul className="divide-y divide-line text-sm">
                  {creneaux.map((c) => (
                    <li key={c.id} className="py-2">
                      <strong>{JOURS[c.jourSemaine]} {c.heureDebut.slice(0, 5)}–{c.heureFin.slice(0, 5)}</strong> · {c.matiereNom}
                      <span className="text-muted">{c.salle ? ` · ${c.salle}` : ""}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </PageBody>
    </>
  );
}
