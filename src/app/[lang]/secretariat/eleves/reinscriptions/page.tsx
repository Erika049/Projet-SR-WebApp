// Route : /[lang]/secretariat/eleves/reinscriptions — Réinscrire les élèves pour 2027-2028 (CU-SEC-02).
import { getLang, getT } from "@/lib/i18n/server";
import { numeroPage, texteRecherche } from "@/lib/api/pagination";
import { premier } from "@/lib/utils";
import { listerReinscriptions } from "@/features/eleves/queries";
import { listerClasses } from "@/features/parametrage/queries";
import { reinscrire } from "@/features/eleves/actions";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pagination, Table, Td, Th } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";
import { Personne } from "@/components/ui/avatar";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function ReinscriptionsPage({ searchParams }: PageProps<"/[lang]/secretariat/eleves/reinscriptions">) {
  const [sp, t, lang, classes] = await Promise.all([searchParams, getT(), getLang(), listerClasses()]);
  const q = texteRecherche(sp.q);
  const classeId = premier(sp.classe) || undefined;
  const r = await listerReinscriptions({ q, classeId, page: numeroPage(sp.page) });
  const base = `/${lang}/secretariat/eleves/reinscriptions`;

  return (
    <>
      <PageHeader
        titre={t("Réinscriptions 2027-2028", "Re-enrolments 2027-2028")}
        filAriane={[{ href: `/${lang}/secretariat/eleves`, libelle: t("Élèves", "Students") }]}
        sousTitre={t("Le niveau proposé suit le passage normal ; la décision du conseil de classe peut le modifier.", "The suggested level follows normal promotion; the class council may change it.")}
      />
      <PageBody>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard libelle={t("Réinscrits", "Re-enrolled")} valeur={r.faites} ton="succes" />
          <StatCard libelle={t("Restant à réinscrire", "Still to re-enrol")} valeur={r.restantes} ton="alerte" />
        </div>
        <Card>
          <form method="get" className="mb-4 flex flex-wrap gap-2">
            <input name="q" defaultValue={q} placeholder={t("Nom ou matricule…", "Name or ID…")} className="input max-w-xs" />
            <select name="classe" defaultValue={classeId ?? ""} className="input w-auto">
              <option value="">{t("Toutes les classes", "All classes")}</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.libelle}</option>)}
            </select>
            <button className="rounded-lg bg-navy-700 px-4 py-2 text-sm font-semibold text-white">{t("Filtrer", "Filter")}</button>
          </form>
          <Table>
            <thead>
              <tr>
                <Th>{t("Élève", "Student")}</Th>
                <Th>{t("Classe actuelle", "Current class")}</Th>
                <Th>{t("Niveau proposé", "Suggested level")}</Th>
                <Th>{t("Réinscription", "Re-enrolment")}</Th>
              </tr>
            </thead>
            <tbody>
              {r.items.map(({ eleve: e, niveauPropose, reinscription }) => {
                const options = classes.filter((c) => c.niveau === niveauPropose || c.id === e.classeId);
                return (
                  <tr key={e.id}>
                    <Td><Personne nom={`${e.prenom} ${e.nom}`} detail={e.matricule} /></Td>
                    <Td>{e.classe.libelle}</Td>
                    <Td>{niveauPropose ?? t("Fin de cycle", "End of cycle")}</Td>
                    <Td>
                      {reinscription ? (
                        <Badge ton="succes">{t("Réinscrit en", "Re-enrolled in")} {reinscription.classe.libelle}</Badge>
                      ) : niveauPropose ? (
                        <form action={reinscrire.bind(null, e.id)} className="flex items-center gap-2">
                          <select name="classeId" className="input w-auto py-1.5" defaultValue={options.find((c) => c.niveau === niveauPropose)?.id}>
                            {options.map((c) => <option key={c.id} value={c.id}>{c.libelle}{c.id === e.classeId ? ` (${t("redoublement", "repeat")})` : ""}</option>)}
                          </select>
                          <SubmitButton taille="sm">{t("Réinscrire", "Re-enrol")}</SubmitButton>
                        </form>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <Pagination page={r.page} total={r.total} taille={r.taille} base={base} params={{ q: q || undefined, classe: classeId }} t={t} />
        </Card>
      </PageBody>
    </>
  );
}
