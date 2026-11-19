// Route : /[lang]/direction/notes-bulletins/[classeId]?periode= — Moyennes par matière, moyenne générale et rang.
import { notFound } from "next/navigation";
import { getLang, getT } from "@/lib/i18n/server";
import { premier } from "@/lib/utils";
import { anneeCourante, classes as lireClasses, periodes as lirePeriodes, resultats } from "@/lib/api/backend";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { LigneVide, Table, Td, Th } from "@/components/ui/data-table";
import { Tabs } from "@/components/ui/tabs";

export default async function ResultatsClassePage({ params, searchParams }: PageProps<"/[lang]/direction/notes-bulletins/[classeId]">) {
  const [{ classeId }, sp, t, lang] = await Promise.all([params, searchParams, getT(), getLang()]);
  const classe = (await lireClasses()).find((c) => c.id === classeId);
  if (!classe) notFound();
  const annee = await anneeCourante();
  const periodes = annee ? (await lirePeriodes(annee.id)).filter((p) => p.type !== "ANNUELLE") : [];
  const periode = periodes.find((p) => p.id === premier(sp.periode));
  const r = await resultats(classeId, periode?.id);
  const base = `/${lang}/direction/notes-bulletins/${classeId}`;
  const note = (v: number | null | undefined) => (v === null || v === undefined ? "—" : Number(v).toFixed(2));
  return (
    <>
      <PageHeader titre={t(`Résultats · ${classe.nom}`, `Results · ${classe.nom}`)} filAriane={[{ href: `/${lang}/direction/notes-bulletins`, libelle: t("Notes et résultats", "Marks and results") }]} />
      <PageBody>
        <Tabs
          onglets={[
            { href: base, libelle: t("Toute l'année", "Whole year") },
            ...periodes.map((p) => ({
              href: `${base}?periode=${p.id}`,
              libelle: p.type === "SEQUENCE" ? t(`Séquence ${p.numero}`, `Sequence ${p.numero}`) : t(`Trimestre ${p.numero}`, `Term ${p.numero}`),
            })),
          ]}
        />
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>{t("Rang", "Rank")}</Th>
                <Th>{t("Élève", "Student")}</Th>
                {r.matieres.map((m) => (
                  <Th key={m.id}>{m.nom} <span className="text-[10px] font-normal text-muted">×{m.coefficient}</span></Th>
                ))}
                <Th>{t("Moyenne", "Average")}</Th>
              </tr>
            </thead>
            <tbody>
              {r.eleves.length === 0 && <LigneVide colSpan={3 + r.matieres.length} texte={t("Aucun élève.", "No student.")} />}
              {r.eleves.map((e) => (
                <tr key={e.eleveId}>
                  <Td className="font-semibold">{e.rang ?? "—"}</Td>
                  <Td>{e.nom} {e.prenom}</Td>
                  {r.matieres.map((m) => (
                    <Td key={m.id}>{note(e.moyennes[m.id])}</Td>
                  ))}
                  <Td className="font-bold text-navy-800">{note(e.moyenneGenerale)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </PageBody>
    </>
  );
}
