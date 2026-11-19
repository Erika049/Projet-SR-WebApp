// Route : /[lang]/plateforme/etablissements — Établissements de la plateforme (CU-SAD-01).
import Link from "next/link";
import { Plus } from "lucide-react";
import { getLang, getT } from "@/lib/i18n/server";
import { nombre } from "@/lib/format";
import { numeroPage, texteRecherche } from "@/lib/api/pagination";
import { PLAN, STATUT_ETABLISSEMENT, lib, ton } from "@/lib/labels";
import { premier } from "@/lib/utils";
import { listerEtablissements } from "@/features/plateforme/queries";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { LigneVide, Pagination, Table, Td, Th } from "@/components/ui/data-table";

export default async function EtablissementsPage({ searchParams }: PageProps<"/[lang]/plateforme/etablissements">) {
  const [sp, t, lang] = await Promise.all([searchParams, getT(), getLang()]);
  const q = texteRecherche(sp.q);
  const statut = premier(sp.statut) || undefined;
  const p = await listerEtablissements({ q, statut, page: numeroPage(sp.page) });
  const base = `/${lang}/plateforme/etablissements`;
  return (
    <>
      <PageHeader
        titre={t("Établissements", "Schools")}
        sousTitre={t(`${p.total} établissements sur la plateforme`, `${p.total} schools on the platform`)}
        actions={<ButtonLink href={`${base}/nouveau`}><Plus className="size-4" /> {t("Créer un établissement", "Create a school")}</ButtonLink>}
      />
      <PageBody>
        <Card>
          <form method="get" className="mb-4 flex flex-wrap gap-2">
            <input name="q" defaultValue={q} placeholder={t("Nom, code ou ville…", "Name, code or city…")} className="input max-w-xs" />
            <select name="statut" defaultValue={statut ?? ""} className="input w-auto">
              <option value="">{t("Tous les statuts", "All statuses")}</option>
              {Object.keys(STATUT_ETABLISSEMENT).map((s) => <option key={s} value={s}>{lib(STATUT_ETABLISSEMENT, s, t)}</option>)}
            </select>
            <button className="rounded-lg bg-navy-700 px-4 py-2 text-sm font-semibold text-white">{t("Filtrer", "Filter")}</button>
          </form>
          <Table>
            <thead>
              <tr>
                <Th>{t("Code", "Code")}</Th>
                <Th>{t("Établissement", "School")}</Th>
                <Th>{t("Ville", "City")}</Th>
                <Th>{t("Plan", "Plan")}</Th>
                <Th>{t("Élèves", "Students")}</Th>
                <Th>{t("Statut", "Status")}</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {p.items.length === 0 && <LigneVide colSpan={7} texte={t("Aucun établissement.", "No schools.")} />}
              {p.items.map((e) => (
                <tr key={e.id}>
                  <Td className="font-mono text-xs">{e.code}</Td>
                  <Td className="font-semibold">{e.nom}</Td>
                  <Td>{e.ville}</Td>
                  <Td><Badge ton={ton(PLAN, e.plan)}>{lib(PLAN, e.plan, t)}</Badge></Td>
                  <Td>{nombre(e.effectifEleves, lang)}</Td>
                  <Td><Badge ton={ton(STATUT_ETABLISSEMENT, e.statut)}>{lib(STATUT_ETABLISSEMENT, e.statut, t)}</Badge></Td>
                  <Td className="text-right"><Link href={`${base}/${e.id}`} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-navy-700 hover:bg-navy-50">{t("Ouvrir", "Open")}</Link></Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={p.page} total={p.total} taille={p.taille} base={base} params={{ q: q || undefined, statut }} t={t} />
        </Card>
      </PageBody>
    </>
  );
}
