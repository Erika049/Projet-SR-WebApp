// Route : /[lang]/direction/notes-bulletins — Notes et bulletins (CU-DIR-05). Bascule Séquences / Trimestres via ?vue=.
import { getLang, getT } from "@/lib/i18n/server";
import { dateCourte, jourMois } from "@/lib/format";
import { premier } from "@/lib/utils";
import { suiviBulletins } from "@/features/notes-bulletins/queries";
import { BulletinsTable } from "@/features/notes-bulletins/components/bulletins-table";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, Note } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

export default async function NotesBulletinsPage({ searchParams }: PageProps<"/[lang]/direction/notes-bulletins">) {
  const [sp, t, lang] = await Promise.all([searchParams, getT(), getLang()]);
  const vue = premier(sp.vue) === "trimestre" ? "trimestre" : "sequence";
  const n = Math.min(vue === "sequence" ? 6 : 3, Math.max(1, Number(premier(sp.n)) || 1));
  const s = await suiviBulletins(vue, n);
  const base = `/${lang}/direction/notes-bulletins`;
  const libelle = vue === "sequence" ? t(`Séquence ${n}`, `Sequence ${n}`) : t(`Trimestre ${n}`, `Term ${n}`);

  return (
    <>
      <PageHeader
        titre={t("Notes et bulletins", "Marks and report cards")}
        sousTitre={t("Un bulletin n'est visible par les parents qu'après validation et publication par la direction.", "A report card is visible to parents only after approval and publication by management.")}
        actions={
          s.sequence?.saisieJusquau ? (
            <Badge ton="succes">{t("Saisie ouverte jusqu'au", "Entry open until")} {jourMois(s.sequence.saisieJusquau, lang)}</Badge>
          ) : s.sequence?.statut === "cloturee" ? (
            <Badge ton="navy">{t("Saisie clôturée", "Entry closed")}</Badge>
          ) : null
        }
      />
      <PageBody>
        <div className="flex flex-wrap items-center gap-3">
          <Tabs
            onglets={[
              { href: base, libelle: t("Séquences", "Sequences") },
              { href: `${base}?vue=trimestre`, libelle: t("Trimestres", "Terms") },
            ]}
          />
          <Tabs
            onglets={Array.from({ length: vue === "sequence" ? 6 : 3 }, (_, i) => ({
              href: i === 0 ? (vue === "sequence" ? base : `${base}?vue=trimestre`) : `${base}?vue=${vue}&n=${i + 1}`,
              libelle: vue === "sequence" ? `S${i + 1}` : `T${i + 1}`,
            }))}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard libelle={t("Notes saisies", "Marks entered")} valeur={`${s.progression} %`} detail={libelle} ton="succes" />
          <StatCard libelle={t("Bulletins validés ou publiés", "Approved or published")} valeur={`${s.validesOuPublies} / ${s.lignes.length}`} detail={t("classes", "classes")} />
          <StatCard libelle={t("À traiter", "To handle")} valeur={s.aValider} detail={t(`${s.aValider} à valider · ${s.incomplets} avec notes incomplètes`, `${s.aValider} to approve · ${s.incomplets} incomplete`)} ton="alerte" />
        </div>
        <Card>
          <CardHeader
            titre={`${t("Classes", "Classes")} · ${libelle}`}
            sousTitre={s.sequence ? `${dateCourte(s.sequence.debut, lang)} – ${dateCourte(s.sequence.fin, lang)}` : undefined}
            action={<ButtonLink href={`/api/exports/bulletins?lang=${lang}&vue=${vue}&n=${n}`} variante="secondaire" taille="sm" prefetch={false}>{t("Exporter la liste", "Export list")}</ButtonLink>}
          />
          <BulletinsTable lignes={s.lignes.map((l) => ({ classe: { id: l.classe.id, libelle: l.classe.libelle }, progression: l.progression, statut: l.statut }))} sequence={n} actions={vue === "sequence"} />
        </Card>
        {vue === "trimestre" && (
          <Note>
            {t(
              "Le bulletin trimestriel est calculé à partir des deux séquences du trimestre. Validez et publiez chaque séquence depuis l'onglet « Séquences ».",
              "The term report is computed from the term's two sequences. Approve and publish each sequence from the “Sequences” tab.",
            )}
          </Note>
        )}
      </PageBody>
    </>
  );
}
