// Route : /[lang]/comptabilite/situation/[inscriptionId] — Situation financière d'un élève (le paramètre est l'identifiant de l'élève).
import Link from "next/link";
import { notFound } from "next/navigation";
import { Receipt } from "lucide-react";
import { getLang, getT } from "@/lib/i18n/server";
import { dateCourte, fcfa } from "@/lib/format";
import { MODE_PAIEMENT, lib } from "@/lib/labels";
import { MODES, situation } from "@/lib/api/backend";
import { relancerImpayes } from "@/features/finances/actions";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GrilleStats, StatCard } from "@/components/ui/stat-card";
import { LigneVide, Table, Td, Th } from "@/components/ui/data-table";
import { Formulaire } from "@/components/ui/formulaire";

export default async function SituationPage({ params }: PageProps<"/[lang]/comptabilite/situation/[inscriptionId]">) {
  const [{ inscriptionId }, t, lang] = await Promise.all([params, getT(), getLang()]);
  const s = await situation(inscriptionId);
  if (!s) notFound();
  const tries = [...s.fraisApplicables].sort((a, b) => a.dateEcheance.localeCompare(b.dateEcheance));
  // Les versements sont considérés réglés dans l'ordre des échéances.
  const frais = tries.map((f, i) => ({ ...f, cumul: tries.slice(0, i + 1).reduce((x, y) => x + Number(y.montant), 0) }));
  return (
    <>
      <PageHeader
        titre={`${s.eleve.prenom} ${s.eleve.nom}`}
        filAriane={[{ href: `/${lang}/comptabilite/situation`, libelle: t("Situation élève", "Student account") }]}
        actions={
          <Link href={`/${lang}/comptabilite/paiements/nouveau?eleve=${s.eleveId}`} className="inline-flex items-center gap-2 rounded-lg bg-navy-700 px-4 py-2 text-sm font-semibold text-white">
            <Receipt className="size-4" /> {t("Enregistrer un paiement", "Record a payment")}
          </Link>
        }
      />
      <PageBody>
        <GrilleStats>
          <StatCard libelle={t("Total dû", "Total due")} valeur={fcfa(Number(s.totalDu), lang)} detail={t("Année en cours", "Current year")} />
          <StatCard libelle={t("Payé", "Paid")} valeur={fcfa(Number(s.totalPaye), lang)} detail={t(`${s.paiements.filter((p) => p.statut === "VALIDE").length} paiements`, `${s.paiements.filter((p) => p.statut === "VALIDE").length} payments`)} ton="succes" />
          <StatCard libelle={t("Reste à payer", "Balance")} valeur={fcfa(Math.max(0, Number(s.solde)), lang)} detail={Number(s.solde) > 0 ? t("À régler", "To pay") : t("Soldé", "Settled")} ton={Number(s.solde) > 0 ? "danger" : "succes"} />
        </GrilleStats>
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader titre={t("Échéancier", "Payment schedule")} />
            <Table>
              <thead><tr><Th>{t("Versement", "Instalment")}</Th><Th>{t("Montant", "Amount")}</Th><Th>{t("Échéance", "Due")}</Th><Th /></tr></thead>
              <tbody>
                {frais.length === 0 && <LigneVide colSpan={4} texte={t("Aucun frais pour le niveau de la classe.", "No fee for the class level.")} />}
                {frais.map((f) => {
                  const regle = Number(s.totalPaye) >= f.cumul;
                  return (
                    <tr key={f.id}>
                      <Td className="font-semibold">{f.libelle}</Td>
                      <Td>{fcfa(Number(f.montant), lang)}</Td>
                      <Td className="text-muted">{dateCourte(f.dateEcheance, lang)}</Td>
                      <Td><Badge ton={regle ? "succes" : "alerte"}>{regle ? t("Réglé", "Paid") : t("À payer", "Due")}</Badge></Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            {Number(s.solde) > 0 && (
              <div className="mt-4 border-t border-line pt-4">
                <Formulaire action={relancerImpayes} libelle={t("Relancer les parents", "Remind the parents")} variante="secondaire">
                  <input type="hidden" name="eleveId" value={s.eleveId} />
                </Formulaire>
              </div>
            )}
          </Card>
          <Card>
            <CardHeader titre={t("Paiements", "Payments")} />
            <Table>
              <thead><tr><Th>{t("Date", "Date")}</Th><Th>{t("Montant", "Amount")}</Th><Th>{t("Mode", "Method")}</Th><Th>{t("Reçu", "Receipt")}</Th></tr></thead>
              <tbody>
                {s.paiements.length === 0 && <LigneVide colSpan={4} texte={t("Aucun paiement.", "No payment.")} />}
                {s.paiements.map((p) => (
                  <tr key={p.id}>
                    <Td className="text-muted">{dateCourte(p.date, lang)}</Td>
                    <Td className="font-semibold">{fcfa(Number(p.montant), lang)} {p.statut === "ANNULE" && <Badge ton="danger">{t("Annulé", "Cancelled")}</Badge>}</Td>
                    <Td>{lib(MODE_PAIEMENT, MODES[p.mode], t)}</Td>
                    <Td><Link href={`/${lang}/comptabilite/paiements/${p.id}`} className="font-mono text-xs text-navy-700 hover:underline">{p.numeroRecu}</Link></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>
      </PageBody>
    </>
  );
}
