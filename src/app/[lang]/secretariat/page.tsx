// Route : /[lang]/secretariat — Accueil du secrétariat : demandes, dossiers incomplets, actions rapides.
import Link from "next/link";
import { FileText, Inbox, Upload, UserPlus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/dal";
import { getLang, getT } from "@/lib/i18n/server";
import { dateCourte, quand, aujourdhuiIso } from "@/lib/format";
import { tableauSecretariat } from "@/features/tableaux-de-bord/queries";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { GrilleStats, StatCard } from "@/components/ui/stat-card";
import { Compteur } from "@/components/ui/badge";

export default async function AccueilSecretariatPage() {
  const [t, lang, session, d] = await Promise.all([getT(), getLang(), getCurrentUser(), tableauSecretariat()]);
  const prenom = session.nomAffiche.split(" ")[1] ?? "";
  const base = `/${lang}/secretariat`;
  const actions = [
    [t("Inscrire un élève", "Enrol a student"), `${base}/eleves/nouveau`, UserPlus],
    [t("Certificat de scolarité", "School certificate"), `${base}/eleves`, FileText],
    [t("Traiter une demande", "Handle a request"), `${base}/demandes`, Inbox],
    [t("Importer des élèves", "Import students"), `${base}/eleves/import`, Upload],
  ] as const;
  const taches: [string, number, string][] = [
    [t(`Traiter les ${d.demandes.liaisons} demandes de liaison`, `Handle ${d.demandes.liaisons} link requests`), d.demandes.liaisons, `${base}/demandes`],
    [t(`Traiter les ${d.demandes.corrections} demandes de correction`, `Handle ${d.demandes.corrections} correction requests`), d.demandes.corrections, `${base}/demandes`],
    [t(`Compléter ${d.stats.incomplets} dossiers incomplets`, `Complete ${d.stats.incomplets} incomplete files`), d.stats.incomplets, `${base}/eleves?dossier=incomplet`],
    [t("Remettre les codes de liaison aux nouveaux parents", "Hand link codes to new parents"), 0, `${base}/eleves?liaison=non_liee`],
  ];

  return (
    <>
      <PageHeader titre={t("Accueil", "Home")} sousTitre={`${t("Bonjour", "Hello")} ${prenom} · Lycée bilingue de Bafoussam · ${dateCourte(aujourdhuiIso(), lang)}`} />
      <PageBody>
        <GrilleStats>
          <StatCard libelle={t("Demandes à traiter", "Requests to handle")} valeur={d.demandes.total} detail={t(`${d.demandes.liaisons} liaisons · ${d.demandes.corrections} corrections`, `${d.demandes.liaisons} links · ${d.demandes.corrections} corrections`)} ton="alerte" />
          <StatCard libelle={t("Dossiers incomplets", "Incomplete files")} valeur={d.stats.incomplets} detail={t("pièces manquantes", "missing documents")} ton="danger" />
          <StatCard libelle={t("Élèves inscrits", "Enrolled students")} valeur={d.stats.total} detail={t(`${d.nouveauxDuJour} aujourd'hui`, `${d.nouveauxDuJour} today`)} ton="succes" />
          <StatCard libelle={t("Attente directeur", "Awaiting principal")} valeur={d.attenteDirecteur} detail={t("corrections d'identité à valider", "identity corrections to approve")} />
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
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader titre={t("Tâches du jour", "Today's tasks")} />
            <ul className="divide-y divide-line">
              {taches.map(([libelle, n, href]) => (
                <li key={libelle}>
                  <Link href={href} className="flex items-center justify-between py-3 text-sm hover:text-navy-700">
                    {libelle}
                    {n > 0 && <Compteur valeur={n} />}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardHeader titre={t("Mes dernières actions", "My latest actions")} />
            <ul className="divide-y divide-line">
              {d.dernieresActions.length === 0 && <li className="py-3 text-sm text-muted">{t("Aucune action récente.", "No recent actions.")}</li>}
              {d.dernieresActions.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span><strong>{a.action}</strong> <span className="text-muted">· {a.cible}</span></span>
                  <span className="shrink-0 text-xs text-muted">{quand(a.date, lang)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </PageBody>
    </>
  );
}
