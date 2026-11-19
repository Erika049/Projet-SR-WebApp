// Route : /[lang]/direction/classes — Classes de l'année et taux de remplissage (CU-DIR-02).
import Link from "next/link";
import { Plus } from "lucide-react";
import { getLang, getT } from "@/lib/i18n/server";
import { nomCivil } from "@/lib/utils";
import { listerClasses } from "@/features/parametrage/queries";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { premier } from "@/lib/utils";

export default async function ClassesPage({ searchParams }: PageProps<"/[lang]/direction/classes">) {
  const [sp, t, lang, classes] = await Promise.all([searchParams, getT(), getLang(), listerClasses()]);
  const cycle = premier(sp.cycle);
  const base = `/${lang}/direction/classes`;
  const liste = classes.filter((c) => !cycle || c.cycle === cycle);
  return (
    <>
      <PageHeader
        titre={t("Classes", "Classes")}
        sousTitre={t(`${classes.length} classes · Année 2026-2027`, `${classes.length} classes · Year 2026-2027`)}
        actions={<ButtonLink href={`/${lang}/direction/parametrage/classes`}><Plus className="size-4" /> {t("Nouvelle classe", "New class")}</ButtonLink>}
      />
      <PageBody>
        <Tabs
          onglets={[
            { href: base, libelle: t("Toutes", "All"), compteur: classes.length },
            { href: `${base}?cycle=premier`, libelle: t("Premier cycle", "Lower secondary"), compteur: classes.filter((c) => c.cycle === "premier").length },
            { href: `${base}?cycle=second`, libelle: t("Second cycle", "Upper secondary"), compteur: classes.filter((c) => c.cycle === "second").length },
          ]}
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {liste.map((c) => {
            const taux = Math.round((c.effectif / c.capacite) * 100);
            return (
              <Link key={c.id} href={`${base}/${c.id}`} className="rounded-2xl border border-line bg-white p-5 transition hover:border-navy-200 hover:shadow-sm">
                <div className="flex items-start justify-between">
                  <p className="text-lg font-bold text-navy-800">{c.libelle}</p>
                  <p className="text-sm"><strong>{c.effectif}</strong> / {c.capacite} {t("élèves", "students")}</p>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted">
                  <span>{t("Taux de remplissage", "Fill rate")}</span>
                  <span className="font-semibold text-ink">{taux} %</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${taux > 95 ? "bg-red-500" : "bg-brand-600"}`} style={{ width: `${Math.min(100, taux)}%` }} />
                </div>
                <p className="mt-3 text-xs text-muted">
                  {c.nbMatieres} {t("matières", "subjects")} · {c.titulaire ? `${t("titulaire", "form teacher")} ${nomCivil(c.titulaire)}` : t("titulaire à définir", "form teacher to be set")}
                </p>
              </Link>
            );
          })}
        </div>
      </PageBody>
    </>
  );
}
