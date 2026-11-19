// Route : /[lang]/comptabilite/impayes — Impayés et relances (CU-ECO-06, CU-SYS-03).
import Link from "next/link";
import { getLang, getT } from "@/lib/i18n/server";
import { fcfa, jourMois, nombre } from "@/lib/format";
import { numeroPage } from "@/lib/api/pagination";
import { premier } from "@/lib/utils";
import { listerImpayes } from "@/features/finances/queries";
import { relancerParent, relancerTous } from "@/features/finances/actions";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { LigneVide, Pagination, Table, Td, Th } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs } from "@/components/ui/tabs";
import { Personne } from "@/components/ui/avatar";
import { ActionButton } from "@/components/ui/action-button";

export default async function ImpayesPage({ searchParams }: PageProps<"/[lang]/comptabilite/impayes">) {
  const [sp, t, lang] = await Promise.all([searchParams, getT(), getLang()]);
  const filtre = premier(sp.filtre);
  const r = await listerImpayes({ filtre, page: numeroPage(sp.page) });
  const base = `/${lang}/comptabilite/impayes`;
  return (
    <>
      <PageHeader
        titre={t("Impayés et relances", "Arrears and reminders")}
        sousTitre={t("Élèves dont l'échéance est dépassée.", "Students past their due date.")}
        actions={
          <>
            <ButtonLink href={`/api/exports/impayes?lang=${lang}`} variante="secondaire" prefetch={false}>{t("Exporter", "Export")}</ButtonLink>
            <ActionButton action={relancerTous} variante="primaire" taille="md" confirmation={t(`Relancer les ${r.nombre} parents par SMS ou notification ?`, `Remind all ${r.nombre} parents by SMS or notification?`)}>
              {t(`Relancer les ${r.nombre} parents`, `Remind all ${r.nombre} parents`)}
            </ActionButton>
          </>
        }
      />
      <PageBody>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard libelle={t("Élèves en impayé", "Students in arrears")} valeur={r.nombre} detail={t("Échéance dépassée", "Past due")} ton="danger" />
          <StatCard libelle={t("Montant en retard", "Overdue amount")} valeur={nombre(r.montant, lang)} detail="FCFA" ton="alerte" />
          <StatCard libelle={t("Relances envoyées", "Reminders sent")} valeur={r.relancesSemaine} detail={t("Cette semaine", "This week")} />
        </div>
        <Card>
          <Tabs
            className="mb-4"
            onglets={[
              { href: base, libelle: t("Tous", "All"), compteur: r.nombre },
              { href: `${base}?filtre=7`, libelle: t("Plus de 7 jours", "Over 7 days"), compteur: r.plusDe7 },
              { href: `${base}?filtre=30`, libelle: t("Plus de 30 jours", "Over 30 days"), compteur: r.plusDe30 },
            ]}
          />
          <Table>
            <thead>
              <tr>
                <Th>{t("Élève", "Student")}</Th>
                <Th>{t("Classe", "Class")}</Th>
                <Th>{t("Montant dû", "Amount due")}</Th>
                <Th>{t("Retard", "Overdue")}</Th>
                <Th>{t("Dernière relance", "Last reminder")}</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {r.items.length === 0 && <LigneVide colSpan={6} texte={t("Aucun impayé.", "No arrears.")} />}
              {r.items.map((s) => (
                <tr key={s.eleve.id}>
                  <Td><Link href={`/${lang}/comptabilite/situation/${s.eleve.id}`} className="hover:underline"><Personne nom={`${s.eleve.prenom} ${s.eleve.nom}`} /></Link></Td>
                  <Td>{s.classe?.libelle}</Td>
                  <Td className="font-semibold text-red-600">{fcfa(s.montantEchu, lang)}</Td>
                  <Td><Badge ton={s.retardJours > 30 ? "danger" : s.retardJours > 7 ? "alerte" : "neutre"}>{t(`${s.retardJours} jours`, `${s.retardJours} days`)}</Badge></Td>
                  <Td className="text-muted">{s.derniereRelance ? jourMois(s.derniereRelance, lang) : t("Jamais", "Never")}</Td>
                  <Td className="text-right"><ActionButton action={relancerParent.bind(null, s.eleve.id)}>{t("Relancer", "Remind")}</ActionButton></Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={r.page} total={r.total} taille={r.taille} base={base} params={{ filtre }} t={t} />
          <p className="mt-3 text-xs text-muted">{t("Relance par SMS ou notification, selon les préférences du parent.", "Reminder by SMS or notification, depending on the parent's preferences.")}</p>
        </Card>
      </PageBody>
    </>
  );
}
