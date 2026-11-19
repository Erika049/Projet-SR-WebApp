// Route : /[lang]/direction/notes-bulletins/[classeId] — Aperçu des bulletins d'une classe (CU-DIR-05, CU-SYS-02).
import { notFound } from "next/navigation";
import { getLang, getT } from "@/lib/i18n/server";
import { nombre } from "@/lib/format";
import { STATUT_BULLETIN, lib, ton } from "@/lib/labels";
import { premier } from "@/lib/utils";
import { apercuBulletins } from "@/features/notes-bulletins/queries";
import { publierClasse, validerClasse } from "@/features/notes-bulletins/actions";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, Td, Th } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";
import { ActionButton } from "@/components/ui/action-button";

export default async function ApercuBulletinsPage({ params, searchParams }: PageProps<"/[lang]/direction/notes-bulletins/[classeId]">) {
  const [{ classeId }, sp, t, lang] = await Promise.all([params, searchParams, getT(), getLang()]);
  const sequence = Number(premier(sp.sequence)) || 1;
  const a = await apercuBulletins(classeId, sequence);
  if (!a) notFound();
  const n2 = (v: number) => nombre(v, lang, 2);

  return (
    <>
      <PageHeader
        titre={`${t("Bulletins", "Report cards")} · ${a.classe.libelle}`}
        filAriane={[{ href: `/${lang}/direction/notes-bulletins`, libelle: t("Notes et bulletins", "Marks and report cards") }]}
        sousTitre={t(`Séquence ${sequence} · moyennes et rangs calculés automatiquement`, `Sequence ${sequence} · averages and ranks computed automatically`)}
        actions={
          <>
            <Badge ton={ton(STATUT_BULLETIN, a.statut)}>{lib(STATUT_BULLETIN, a.statut, t)}</Badge>
            {a.statut === "a_valider" && <ActionButton action={validerClasse.bind(null, a.classe.id, sequence)} variante="primaire" taille="md">{t("Valider", "Approve")}</ActionButton>}
            {(a.statut === "a_valider" || a.statut === "valide") && (
              <ActionButton action={publierClasse.bind(null, a.classe.id, sequence)} variante="succes" taille="md" confirmation={t("Publier ? Les parents seront notifiés.", "Publish? Parents will be notified.")}>
                {t("Publier", "Publish")}
              </ActionButton>
            )}
          </>
        }
      />
      <PageBody>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard libelle={t("Moyenne de la classe", "Class average")} valeur={n2(a.stats.moyenneClasse)} />
          <StatCard libelle={t("Premier", "Highest")} valeur={n2(a.stats.premier)} ton="succes" />
          <StatCard libelle={t("Dernier", "Lowest")} valeur={n2(a.stats.dernier)} ton="danger" />
          <StatCard libelle={t("Taux de réussite", "Pass rate")} valeur={`${a.stats.reussite} %`} ton="alerte" />
        </div>
        <Card>
          <CardHeader titre={t("Résultats par élève", "Results per student")} />
          <Table className="min-w-[900px]">
            <thead>
              <tr>
                <Th>{t("Rang", "Rank")}</Th>
                <Th>{t("Élève", "Student")}</Th>
                {a.matieres.map((m) => (
                  <Th key={m.libelle} className="text-center">
                    {m.libelle.slice(0, 5)}
                    <span className="block font-normal normal-case">coef {m.coefficient}</span>
                  </Th>
                ))}
                <Th className="text-center">{t("Moy.", "Avg.")}</Th>
                <Th>{t("Appréciation", "Comment")}</Th>
              </tr>
            </thead>
            <tbody>
              {a.lignes.map((l) => (
                <tr key={l.eleveId}>
                  <Td className="font-bold">{l.rang}{l.rang === 1 ? (lang === "en" ? "st" : "er") : lang === "en" ? "th" : "e"}</Td>
                  <Td className="whitespace-nowrap font-semibold">{l.nom}</Td>
                  {l.moyennes.map((m) => (
                    <Td key={m.matiere} className={`text-center ${m.moyenne < 10 ? "text-red-600" : ""}`}>{n2(m.moyenne)}</Td>
                  ))}
                  <Td className={`text-center font-bold ${l.moyenneGenerale < 10 ? "text-red-600" : "text-navy-800"}`}>{n2(l.moyenneGenerale)}</Td>
                  <Td className="whitespace-nowrap text-muted">{l.appreciation}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </PageBody>
    </>
  );
}
