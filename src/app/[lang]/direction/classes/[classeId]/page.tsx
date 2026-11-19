// Route : /[lang]/direction/classes/[classeId] — Détail d'une classe : élèves, équipe pédagogique.
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLang, getT } from "@/lib/i18n/server";
import { LIAISON, lib, ton } from "@/lib/labels";
import { nomCivil } from "@/lib/utils";
import { getClasse } from "@/features/parametrage/queries";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, Td, Th } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";
import { Personne } from "@/components/ui/avatar";

export default async function DetailClassePage({ params }: PageProps<"/[lang]/direction/classes/[classeId]">) {
  const [{ classeId }, t, lang] = await Promise.all([params, getT(), getLang()]);
  const c = await getClasse(classeId);
  if (!c) notFound();
  const filles = c.eleves.filter((e) => e.sexe === "F").length;
  return (
    <>
      <PageHeader titre={c.libelle} filAriane={[{ href: `/${lang}/direction/classes`, libelle: t("Classes", "Classes") }]} sousTitre={`${c.cycle === "premier" ? t("Premier cycle", "Lower secondary") : t("Second cycle", "Upper secondary")} · ${c.titulaire ? nomCivil(c.titulaire) : t("titulaire à définir", "form teacher to be set")}`} />
      <PageBody>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard libelle={t("Effectif", "Students")} valeur={`${c.effectif} / ${c.capacite}`} />
          <StatCard libelle={t("Filles / garçons", "Girls / boys")} valeur={`${filles} / ${c.effectif - filles}`} />
          <StatCard libelle={t("Redoublants", "Repeating")} valeur={c.eleves.filter((e) => e.redoublant).length} ton="alerte" />
          <StatCard libelle={t("Parents liés", "Linked parents")} valeur={c.eleves.filter((e) => e.liaison === "liee").length} ton="succes" />
        </div>
        <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
          <Card>
            <CardHeader titre={t("Élèves", "Students")} />
            <Table>
              <thead>
                <tr>
                  <Th>{t("Matricule", "ID")}</Th>
                  <Th>{t("Nom", "Name")}</Th>
                  <Th>{t("Accès parent", "Parent access")}</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {c.eleves.map((e) => (
                  <tr key={e.id}>
                    <Td className="font-mono text-xs">{e.matricule}</Td>
                    <Td><Personne nom={`${e.prenom} ${e.nom}`} /></Td>
                    <Td><Badge ton={ton(LIAISON, e.liaison)}>{lib(LIAISON, e.liaison, t)}</Badge></Td>
                    <Td className="text-right"><Link href={`/${lang}/direction/eleves/${e.id}`} className="text-xs font-semibold text-navy-700 hover:underline">{t("Consulter", "View")}</Link></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
          <Card className="h-fit">
            <CardHeader titre={t("Équipe pédagogique", "Teaching team")} />
            <ul className="divide-y divide-line">
              {c.enseignants.map(({ personnel: p, affectation: a }) => (
                <li key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                  <Personne nom={nomCivil(p)} detail={a.matiere} />
                  <span className="text-muted">{a.heures} h</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </PageBody>
    </>
  );
}
