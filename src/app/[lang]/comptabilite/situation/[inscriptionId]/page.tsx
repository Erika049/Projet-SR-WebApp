// Route : /[lang]/comptabilite/situation/[inscriptionId] — Situation financière de l'élève (CU-ECO-01, CU-ECO-04).
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLang, getT } from "@/lib/i18n/server";
import { dateCourte, fcfa, jourMois } from "@/lib/format";
import { MODE_PAIEMENT, STATUT_PAIEMENT, lib, ton } from "@/lib/labels";
import { getSituation, grilleTarifaire } from "@/features/finances/queries";
import { appliquerRemise, relancerParent } from "@/features/finances/actions";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { LigneVide, Table, Td, Th } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";
import { Personne } from "@/components/ui/avatar";
import { ActionButton } from "@/components/ui/action-button";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function SituationElevePage({ params }: PageProps<"/[lang]/comptabilite/situation/[inscriptionId]">) {
  const [{ inscriptionId }, t, lang] = await Promise.all([params, getT(), getLang()]);
  const [s, g] = await Promise.all([getSituation(inscriptionId), grilleTarifaire()]);
  if (!s) notFound();
  const tarif = g.tarifs.find((x) => x.niveau === s.classe?.niveau);

  return (
    <>
      <PageHeader
        titre={t("Situation financière", "Student account")}
        filAriane={[{ href: `/${lang}/comptabilite/situation`, libelle: t("Recherche", "Search") }]}
        actions={
          <>
            {s.montantEchu > 0 && <ActionButton action={relancerParent.bind(null, s.eleve.id)} taille="md">{t("Relancer le parent", "Remind the parent")}</ActionButton>}
            {s.solde > 0 && <ButtonLink href={`/${lang}/comptabilite/paiements/nouveau?eleve=${s.eleve.id}`}>{t("Enregistrer un paiement", "Record a payment")}</ButtonLink>}
          </>
        }
      />
      <PageBody>
        <Card>
          <Personne nom={`${s.eleve.prenom} ${s.eleve.nom}`} detail={`${s.eleve.matricule} · ${s.classe?.libelle} · ${t("Tuteur", "Guardian")} : ${s.eleve.tuteur.nom} (${s.eleve.tuteur.telephone})`} />
        </Card>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard libelle={t("Frais annuels", "Annual fees")} valeur={fcfa(s.totalDu, lang)} detail={s.remise ? t(`Remise : ${fcfa(s.remise, lang)}`, `Discount: ${fcfa(s.remise, lang)}`) : undefined} />
          <StatCard libelle={t("Payé", "Paid")} valeur={fcfa(s.paye, lang)} ton="succes" />
          <StatCard
            libelle={t("Solde", "Balance")}
            valeur={fcfa(s.solde, lang)}
            detail={s.montantEchu ? t(`${fcfa(s.montantEchu, lang)} en retard de ${s.retardJours} jours`, `${fcfa(s.montantEchu, lang)} overdue by ${s.retardJours} days`) : s.prochaineEcheance ? `${t("avant le", "before")} ${dateCourte(s.prochaineEcheance.dateLimite, lang)}` : undefined}
            ton={s.montantEchu ? "danger" : "alerte"}
          />
        </div>
        <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
          <Card>
            <CardHeader titre={t("Versements", "Payments")} />
            <Table>
              <thead>
                <tr>
                  <Th>{t("Date", "Date")}</Th>
                  <Th>{t("Montant", "Amount")}</Th>
                  <Th>{t("Mode", "Method")}</Th>
                  <Th>{t("Reçu", "Receipt")}</Th>
                  <Th>{t("Statut", "Status")}</Th>
                </tr>
              </thead>
              <tbody>
                {s.paiements.length === 0 && s.declarations.filter((d) => d.statut === "en_attente").length === 0 && <LigneVide colSpan={5} texte={t("Aucun versement.", "No payments.")} />}
                {s.declarations.filter((d) => d.statut === "en_attente").map((d) => (
                  <tr key={d.id}>
                    <Td>{dateCourte(d.date, lang)}</Td>
                    <Td className="font-semibold">{fcfa(d.montant, lang)}</Td>
                    <Td>{lib(MODE_PAIEMENT, d.mode, t)}</Td>
                    <Td>—</Td>
                    <Td><Link href={`/${lang}/comptabilite/declarations`}><Badge ton="alerte">{t("À vérifier", "To verify")}</Badge></Link></Td>
                  </tr>
                ))}
                {s.paiements.map((p) => (
                  <tr key={p.id}>
                    <Td>{dateCourte(p.date, lang)}</Td>
                    <Td className="font-semibold">{fcfa(p.montant, lang)}</Td>
                    <Td>{lib(MODE_PAIEMENT, p.mode, t)}</Td>
                    <Td><Link href={`/${lang}/comptabilite/paiements/${p.id}`} className="font-mono text-xs font-semibold text-navy-700 hover:underline">{p.numeroRecu}</Link></Td>
                    <Td><Badge ton={ton(STATUT_PAIEMENT, p.statut)}>{lib(STATUT_PAIEMENT, p.statut, t)}</Badge></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
          <div className="space-y-6">
            <Card>
              <CardHeader titre={t("Échéancier", "Schedule")} sousTitre={tarif ? `${tarif.niveau} · ${fcfa(tarif.montant, lang)}` : undefined} />
              <ul className="space-y-2 text-sm">
                {tarif?.versements.map((v) => (
                  <li key={v.libelle} className="flex justify-between">
                    <span>{v.libelle} <span className="text-muted">· {jourMois(v.dateLimite, lang)}</span></span>
                    <strong>{fcfa(v.montant, lang)}</strong>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted">{t("Dernière relance", "Last reminder")} : {s.derniereRelance ? jourMois(s.derniereRelance, lang) : t("jamais", "never")}</p>
            </Card>
            <Card>
              <CardHeader titre={t("Remise ou bourse", "Discount or scholarship")} sousTitre="CU-ECO-04" />
              <form action={appliquerRemise.bind(null, s.eleve.id)} className="flex gap-2">
                <select name="remiseId" defaultValue={s.eleve.remiseId ?? ""} className="input">
                  <option value="">{t("Aucune", "None")}</option>
                  {g.remises.map((r) => <option key={r.id} value={r.id}>{r.libelle} ({r.taux} %)</option>)}
                </select>
                <SubmitButton variante="secondaire">{t("Appliquer", "Apply")}</SubmitButton>
              </form>
            </Card>
          </div>
        </div>
      </PageBody>
    </>
  );
}
