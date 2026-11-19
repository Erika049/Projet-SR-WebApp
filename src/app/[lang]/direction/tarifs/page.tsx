// Route : /[lang]/direction/tarifs — Grille tarifaire et échéanciers (CU-DIR-04).
import Link from "next/link";
import { getLang, getT } from "@/lib/i18n/server";
import { dateCourte, fcfa } from "@/lib/format";
import { premier } from "@/lib/utils";
import { grilleTarifaire } from "@/features/finances/queries";
import { RemiseForm, TarifForm } from "@/features/finances/components/tarif-forms";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/data-table";
import { ButtonLink } from "@/components/ui/button";

export default async function TarifsPage({ searchParams }: PageProps<"/[lang]/direction/tarifs">) {
  const [sp, t, lang, g] = await Promise.all([searchParams, getT(), getLang(), grilleTarifaire()]);
  const niveau = premier(sp.niveau) ?? g.tarifs[0]?.niveau;
  const nouveau = niveau === "__nouveau";
  const choisi = g.tarifs.find((x) => x.niveau === niveau);
  const base = `/${lang}/direction/tarifs`;

  return (
    <>
      <PageHeader
        titre={t("Grille tarifaire et échéanciers", "Fee schedule and instalments")}
        sousTitre={t("Les montants s'appliquent à tous les élèves du niveau pour l'année 2026-2027.", "Amounts apply to all students of the level for 2026-2027.")}
      />
      <PageBody>
        <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
          <Card>
            <CardHeader titre={t("Frais par niveau", "Fees per level")} action={<ButtonLink href={`${base}?niveau=__nouveau`} variante="secondaire" taille="sm">{t("Ajouter un niveau", "Add a level")}</ButtonLink>} />
            <Table>
              <thead>
                <tr>
                  <Th>{t("Niveau", "Level")}</Th>
                  <Th>{t("Frais annuels", "Annual fees")}</Th>
                  <Th>{t("Échéancier", "Schedule")}</Th>
                  <Th>{t("Élèves", "Students")}</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {g.tarifs.map((x) => (
                  <tr key={x.niveau} className={x.niveau === niveau ? "bg-navy-50/50" : ""}>
                    <Td className="font-semibold">{x.niveau}</Td>
                    <Td>{fcfa(x.montant, lang)}</Td>
                    <Td>{t(`${x.versements.length} versements`, `${x.versements.length} instalments`)}</Td>
                    <Td>{x.eleves}</Td>
                    <Td className="text-right">
                      <Link href={`${base}?niveau=${encodeURIComponent(x.niveau)}`} scroll={false} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-navy-700 hover:bg-navy-50">
                        {t("Modifier", "Edit")}
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
          <div className="space-y-6">
            <Card>
              <CardHeader
                titre={nouveau ? t("Nouveau niveau", "New level") : `${t("Échéancier", "Schedule")} · ${niveau}`}
                sousTitre={choisi ? choisi.versements.map((v) => `${v.libelle} : ${fcfa(v.montant, lang)} ${t("avant le", "before")} ${dateCourte(v.dateLimite, lang)}`).join(" · ") : undefined}
              />
              <TarifForm key={niveau} tarif={choisi} nouveau={nouveau} />
            </Card>
            <Card>
              <CardHeader titre={t("Remises", "Discounts")} sousTitre={t("Appliquées par la comptabilité sur le dossier financier de l'élève.", "Applied by accounting on the student's account.")} />
              <ul className="mb-4 divide-y divide-line">
                {g.remises.map((r) => (
                  <li key={r.id} className="flex justify-between py-2 text-sm">
                    {r.libelle}
                    <strong>{r.taux} %</strong>
                  </li>
                ))}
              </ul>
              <RemiseForm />
            </Card>
          </div>
        </div>
      </PageBody>
    </>
  );
}
