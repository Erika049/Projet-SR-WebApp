// Route : /[lang]/comptabilite/rapports?du=&au= — Rapport de caisse par mode et journal des paiements (CU-ECO-08/09).
import Link from "next/link";
import { getLang, getT } from "@/lib/i18n/server";
import { aujourdhuiIso, dateCourte, fcfa } from "@/lib/format";
import { MODE_PAIEMENT, lib } from "@/lib/labels";
import { premier } from "@/lib/utils";
import { MODES, journalCaisse } from "@/lib/api/backend";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GrilleStats, StatCard } from "@/components/ui/stat-card";
import { LigneVide, Table, Td, Th } from "@/components/ui/data-table";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export default async function RapportsPage({ searchParams }: PageProps<"/[lang]/comptabilite/rapports">) {
  const [sp, t, lang] = await Promise.all([searchParams, getT(), getLang()]);
  const aujourdhui = aujourdhuiIso();
  const du = DATE.test(premier(sp.du) ?? "") ? premier(sp.du)! : `${aujourdhui.slice(0, 8)}01`;
  const au = DATE.test(premier(sp.au) ?? "") ? premier(sp.au)! : aujourdhui;
  const journal = await journalCaisse(du, au);
  const valides = journal.filter((p) => p.statut === "VALIDE");
  const parMode = Object.entries(MODES).map(([api, cle]) => {
    const l = valides.filter((p) => p.mode === api);
    return { cle, nombre: l.length, total: l.reduce((s, p) => s + Number(p.montant), 0) };
  }).filter((m) => m.nombre > 0);
  const total = valides.reduce((s, p) => s + Number(p.montant), 0);
  return (
    <>
      <PageHeader titre={t("Caisse et rapports", "Cash and reports")} sousTitre={`${dateCourte(du, lang)} → ${dateCourte(au, lang)}`} />
      <PageBody>
        <form method="get" className="flex flex-wrap items-end gap-3">
          <label className="text-sm"><span className="mb-1 block font-semibold">{t("Du", "From")}</span><input type="date" name="du" defaultValue={du} className="input" /></label>
          <label className="text-sm"><span className="mb-1 block font-semibold">{t("Au", "To")}</span><input type="date" name="au" defaultValue={au} className="input" /></label>
          <button className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-navy-700">{t("Afficher", "Show")}</button>
          <Link href={`?du=${aujourdhui}&au=${aujourdhui}`} className="text-sm font-semibold text-navy-700 hover:underline">{t("Aujourd'hui", "Today")}</Link>
          <a href={`/api/exports/paiements?du=${du}&au=${au}`} className="ml-auto text-sm font-semibold text-navy-700 hover:underline">{t("Exporter (Excel)", "Export (Excel)")}</a>
        </form>
        <GrilleStats>
          <StatCard libelle={t("Encaissé", "Collected")} valeur={fcfa(total, lang)} detail={t(`${valides.length} paiements`, `${valides.length} payments`)} ton="succes" />
          {parMode.map((m) => (
            <StatCard key={m.cle} libelle={lib(MODE_PAIEMENT, m.cle, t)} valeur={fcfa(m.total, lang)} detail={t(`${m.nombre} paiements`, `${m.nombre} payments`)} />
          ))}
        </GrilleStats>
        <Card>
          <CardHeader titre={t("Journal des paiements", "Payment journal")} />
          <Table>
            <thead><tr><Th>{t("Date", "Date")}</Th><Th>{t("Reçu", "Receipt")}</Th><Th>{t("Élève", "Student")}</Th><Th>{t("Montant", "Amount")}</Th><Th>{t("Mode", "Method")}</Th><Th>{t("Encaissé par", "Received by")}</Th></tr></thead>
            <tbody>
              {journal.length === 0 && <LigneVide colSpan={6} texte={t("Aucun paiement sur la période.", "No payment over the period.")} />}
              {journal.map((p) => (
                <tr key={p.id}>
                  <Td className="text-muted">{dateCourte(p.date, lang)}</Td>
                  <Td><Link href={`/${lang}/comptabilite/paiements/${p.id}`} className="font-mono text-xs text-navy-700 hover:underline">{p.numeroRecu}</Link></Td>
                  <Td>{p.elevePrenom} {p.eleveNom}<span className="text-muted">{p.classeNom ? ` · ${p.classeNom}` : ""}</span></Td>
                  <Td className="font-semibold">{fcfa(Number(p.montant), lang)} {p.statut === "ANNULE" && <Badge ton="danger">{t("Annulé", "Cancelled")}</Badge>}</Td>
                  <Td>{lib(MODE_PAIEMENT, MODES[p.mode], t)}</Td>
                  <Td className="text-muted">{p.encaissePar ?? "—"}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </PageBody>
    </>
  );
}
