// Route : /[lang]/secretariat — Accueil du secrétariat : demandes de liaison, élèves sans parent lié, actions rapides.
import Link from "next/link";
import { Inbox, Megaphone, UserPlus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/dal";
import { getLang, getT } from "@/lib/i18n/server";
import { classes as lireClasses, listerDemandesLiaison, repertoire } from "@/lib/api/backend";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { GrilleStats, StatCard } from "@/components/ui/stat-card";

export default async function AccueilSecretariatPage() {
  const [t, lang, session, eleves, classes, demandes] = await Promise.all([getT(), getLang(), getCurrentUser(), repertoire(), lireClasses(), listerDemandesLiaison()]);
  const base = `/${lang}/secretariat`;
  const sansParent = eleves.filter((e) => e.liaison === "NON_LIEE");
  const sansClasse = eleves.filter((e) => !e.classeId);
  const actions = [
    [t("Inscrire un élève", "Enrol a student"), `${base}/eleves/nouveau`, UserPlus],
    [t("Demandes de liaison", "Link requests"), `${base}/demandes`, Inbox],
    [t("Nouvelle annonce", "New announcement"), `${base}/annonces`, Megaphone],
  ] as const;
  return (
    <>
      <PageHeader titre={t("Accueil", "Home")} sousTitre={`${t("Bonjour", "Hello")} ${session.nomAffiche}${session.etablissementNom ? ` · ${session.etablissementNom}` : ""}`} />
      <PageBody>
        <GrilleStats>
          <StatCard libelle={t("Élèves inscrits", "Enrolled students")} valeur={eleves.length} detail={t(`${classes.length} classes`, `${classes.length} classes`)} />
          <StatCard libelle={t("Demandes à valider", "Requests to approve")} valeur={demandes.length} detail={t("Liaisons parent-enfant", "Parent-child links")} ton="alerte" />
          <StatCard libelle={t("Sans parent lié", "Without linked parent")} valeur={sansParent.length} detail={t("Code de liaison à remettre", "Link code to hand out")} ton="danger" />
          <StatCard libelle={t("Sans classe", "Without class")} valeur={sansClasse.length} detail={t("À affecter", "To assign")} />
        </GrilleStats>
        <Card>
          <CardHeader titre={t("Actions rapides", "Quick actions")} />
          <div className="grid gap-3 sm:grid-cols-3">
            {actions.map(([libelle, href, Icone]) => (
              <Link key={libelle} href={href} className="flex items-center gap-3 rounded-xl border border-line p-4 font-semibold text-navy-800 transition hover:border-navy-200 hover:bg-navy-50">
                <span className="grid size-10 place-items-center rounded-lg bg-navy-50 text-navy-700"><Icone className="size-5" /></span>
                {libelle}
              </Link>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader titre={t("Élèves sans parent lié", "Students without a linked parent")} sousTitre={t("Ouvrez le dossier pour enregistrer le tuteur et générer un code de liaison.", "Open the file to record the guardian and generate a link code.")} />
          {sansParent.length === 0 ? (
            <EmptyState titre={t("Tous les élèves ont un parent lié", "Every student has a linked parent")} />
          ) : (
            <ul className="divide-y divide-line text-sm">
              {sansParent.slice(0, 15).map((e) => (
                <li key={e.eleveId} className="flex justify-between py-2">
                  <Link href={`${base}/eleves/${e.eleveId}`} className="font-semibold text-navy-700 hover:underline">{e.nom} {e.prenom}</Link>
                  <span className="text-muted">{e.classeNom ?? "—"}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </PageBody>
    </>
  );
}
