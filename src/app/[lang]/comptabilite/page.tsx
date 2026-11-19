// Route : /[lang]/comptabilite — Tableau de bord comptable : caisse du jour, déclarations, impayés (CU-ECO-08).
import Link from "next/link";
import { FileText, Receipt, Search, AlertTriangle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/dal";
import { getLang, getT } from "@/lib/i18n/server";
import { aujourdhuiIso, fcfa } from "@/lib/format";
import { MODE_PAIEMENT, lib } from "@/lib/labels";
import { MODES, impayes as lireImpayes, journalCaisse, listerDeclarations } from "@/lib/api/backend";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { GrilleStats, StatCard } from "@/components/ui/stat-card";
import { LigneVide, Table, Td, Th } from "@/components/ui/data-table";

export default async function TableauComptablePage() {
  const jour = aujourdhuiIso();
  const [t, lang, session, caisse, declarations, impayes] = await Promise.all([getT(), getLang(), getCurrentUser(), journalCaisse(jour, jour), listerDeclarations(), lireImpayes()]);
  const valides = caisse.filter((p) => p.statut === "VALIDE");
  const base = `/${lang}/comptabilite`;
  const actions = [
    [t("Enregistrer un paiement", "Record a payment"), `${base}/paiements/nouveau`, Receipt],
    [t("Vérifier les déclarations", "Check declarations"), `${base}/declarations`, FileText],
    [t("Situation d'un élève", "Student account"), `${base}/situation`, Search],
    [t("Impayés et relances", "Arrears and reminders"), `${base}/impayes`, AlertTriangle],
  ] as const;
  return (
    <>
      <PageHeader titre={t("Tableau de bord", "Dashboard")} sousTitre={`${t("Bonjour", "Hello")} ${session.nomAffiche}${session.etablissementNom ? ` · ${session.etablissementNom}` : ""}`} />
      <PageBody>
        <GrilleStats>
          <StatCard libelle={t("Caisse du jour", "Today's cash")} valeur={fcfa(valides.reduce((s, p) => s + Number(p.montant), 0), lang)} detail={t(`${valides.length} paiements`, `${valides.length} payments`)} ton="succes" />
          <StatCard libelle={t("Déclarations à vérifier", "Declarations to check")} valeur={declarations.length} detail={t("Envoyées par les parents", "Sent by parents")} ton="alerte" />
          <StatCard libelle={t("Élèves en impayé", "Students in arrears")} valeur={impayes.length} detail={fcfa(impayes.reduce((s, i) => s + Number(i.solde), 0), lang)} ton="danger" />
        </GrilleStats>
        <Card>
          <CardHeader titre={t("Actions rapides", "Quick actions")} />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {actions.map(([libelle, href, Icone]) => (
              <Link key={libelle} href={href} className="flex items-center gap-3 rounded-xl border border-line p-4 font-semibold text-navy-800 transition hover:border-navy-200 hover:bg-navy-50">
                <span className="grid size-10 place-items-center rounded-lg bg-navy-50 text-navy-700"><Icone className="size-5" /></span>
                {libelle}
              </Link>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader titre={t("Paiements du jour", "Today's payments")} />
          <Table>
            <thead><tr><Th>{t("Reçu", "Receipt")}</Th><Th>{t("Élève", "Student")}</Th><Th>{t("Montant", "Amount")}</Th><Th>{t("Mode", "Method")}</Th></tr></thead>
            <tbody>
              {caisse.length === 0 && <LigneVide colSpan={4} texte={t("Aucun paiement aujourd'hui.", "No payment today.")} />}
              {caisse.map((p) => (
                <tr key={p.id}>
                  <Td><Link href={`${base}/paiements/${p.id}`} className="font-mono text-xs text-navy-700 hover:underline">{p.numeroRecu}</Link></Td>
                  <Td>{p.elevePrenom} {p.eleveNom}</Td>
                  <Td className="font-semibold">{fcfa(Number(p.montant), lang)}</Td>
                  <Td>{lib(MODE_PAIEMENT, MODES[p.mode], t)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </PageBody>
    </>
  );
}
