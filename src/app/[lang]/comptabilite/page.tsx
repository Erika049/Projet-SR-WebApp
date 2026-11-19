// Route : /[lang]/comptabilite — Tableau de bord comptable : encaissements du jour (CU-ECO-08).
import Link from "next/link";
import { Banknote, Landmark, Smartphone, Wallet } from "lucide-react";
import { getLang, getT } from "@/lib/i18n/server";
import { dateLongue, fcfa, heure, nombre } from "@/lib/format";
import { MODE_PAIEMENT, lib } from "@/lib/labels";
import { tableauComptable } from "@/features/tableaux-de-bord/queries";
import { cloturerCaisse } from "@/features/finances/actions";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { LigneVide, Table, Td, Th } from "@/components/ui/data-table";
import { GrilleStats, StatCard } from "@/components/ui/stat-card";
import { Personne } from "@/components/ui/avatar";
import { ActionButton } from "@/components/ui/action-button";

export default async function TableauComptablePage() {
  const [t, lang, d] = await Promise.all([getT(), getLang(), tableauComptable()]);
  const c = d.caisse;
  const n = (x: number) => t(`${x} paiement${x > 1 ? "s" : ""}`, `${x} payment${x > 1 ? "s" : ""}`);
  return (
    <>
      <PageHeader
        titre={t("Tableau de bord", "Dashboard")}
        sousTitre={dateLongue(c.date, lang)}
        actions={
          c.cloture ? (
            <Badge ton="navy">{t("Caisse clôturée", "Register closed")}</Badge>
          ) : (
            <ActionButton action={cloturerCaisse} taille="md" confirmation={t(`Clôturer la caisse du jour (${fcfa(c.total, lang)}) ?`, `Close today's register (${fcfa(c.total, lang)})?`)}>
              {t("Clôturer la caisse", "Close the register")}
            </ActionButton>
          )
        }
      />
      <PageBody>
        <GrilleStats>
          <StatCard libelle={t("Espèces", "Cash")} valeur={nombre(c.especes.montant, lang)} detail={`FCFA · ${n(c.especes.nombre)}`} icone={<Banknote className="size-5" />} ton="succes" />
          <StatCard libelle="Mobile Money" valeur={nombre(c.mobile.montant, lang)} detail={`FCFA · ${n(c.mobile.nombre)}`} icone={<Smartphone className="size-5" />} ton="alerte" />
          <StatCard libelle={t("Virements", "Transfers")} valeur={nombre(c.virements.montant, lang)} detail={`FCFA · ${n(c.virements.nombre)}`} icone={<Landmark className="size-5" />} />
          <StatCard libelle={t("Total du jour", "Today's total")} valeur={nombre(c.total, lang)} detail="FCFA" icone={<Wallet className="size-5" />} />
        </GrilleStats>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href={`/${lang}/comptabilite/declarations`} className="rounded-2xl border border-line bg-white p-4 hover:border-navy-200">
            <p className="text-sm text-muted">{t("Déclarations à vérifier", "Declarations to verify")}</p>
            <p className="text-2xl font-bold text-navy-800">{d.declarations}</p>
          </Link>
          <Link href={`/${lang}/comptabilite/impayes`} className="rounded-2xl border border-line bg-white p-4 hover:border-navy-200">
            <p className="text-sm text-muted">{t("Élèves en impayé", "Students in arrears")}</p>
            <p className="text-2xl font-bold text-red-600">{d.impayes.nombre} <span className="text-sm font-medium text-muted">· {fcfa(d.impayes.montant, lang)}</span></p>
          </Link>
        </div>
        <Card>
          <CardHeader
            titre={t("Paiements du jour", "Today's payments")}
            action={<ButtonLink href={`/api/exports/paiements-du-jour?lang=${lang}`} variante="secondaire" taille="sm" prefetch={false}>{t("Exporter Excel", "Export Excel")}</ButtonLink>}
          />
          <Table>
            <thead>
              <tr>
                <Th>{t("Heure", "Time")}</Th>
                <Th>{t("Élève", "Student")}</Th>
                <Th>{t("Classe", "Class")}</Th>
                <Th>{t("Mode", "Method")}</Th>
                <Th>{t("Montant", "Amount")}</Th>
                <Th>{t("Reçu", "Receipt")}</Th>
              </tr>
            </thead>
            <tbody>
              {c.paiements.length === 0 && <LigneVide colSpan={6} texte={t("Aucun paiement aujourd'hui.", "No payments today.")} />}
              {c.paiements.map((p) => (
                <tr key={p.id}>
                  <Td className="font-mono">{heure(p.date)}</Td>
                  <Td><Personne nom={`${p.eleve.prenom} ${p.eleve.nom}`} /></Td>
                  <Td>{p.classe.libelle}</Td>
                  <Td>{lib(MODE_PAIEMENT, p.mode, t)}</Td>
                  <Td className="font-semibold">{fcfa(p.montant, lang)}</Td>
                  <Td><Link href={`/${lang}/comptabilite/paiements/${p.id}`} className="font-mono text-xs font-semibold text-navy-700 hover:underline">{p.numeroRecu}</Link></Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <p className="mt-3 text-xs text-muted">{t("Toute annulation exige un motif et une validation de la direction.", "Every cancellation requires a reason and management approval.")}</p>
        </Card>
      </PageBody>
    </>
  );
}
