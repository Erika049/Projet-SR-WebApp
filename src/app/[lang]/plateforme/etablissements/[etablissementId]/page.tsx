// Route : /[lang]/plateforme/etablissements/[etablissementId] — Aperçu (CU-SAD-03, CU-SAD-05).
import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import { getLang, getT } from "@/lib/i18n/server";
import { dateCourte, derniereConnexion, nombre } from "@/lib/format";
import { PLAN, lib } from "@/lib/labels";
import { getEtablissement } from "@/features/plateforme/queries";
import { actionCompte, changerStatutEtablissement, ouvrirAccesSupport, prolongerAbonnement } from "@/features/plateforme/actions";
import { Card, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Personne } from "@/components/ui/avatar";
import { ActionButton } from "@/components/ui/action-button";

export default async function EtablissementApercuPage({ params }: PageProps<"/[lang]/plateforme/etablissements/[etablissementId]">) {
  const [{ etablissementId }, t, lang] = await Promise.all([params, getT(), getLang()]);
  const e = await getEtablissement(etablissementId);
  if (!e) notFound();
  const suspendu = e.statut === "suspendu";
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard libelle={t("Élèves", "Students")} valeur={nombre(e.effectifEleves, lang)} detail={t(`${e.nbClasses} classes`, `${e.nbClasses} classes`)} />
        <StatCard libelle={t("Personnel", "Staff")} valeur={e.effectifPersonnel} />
        <StatCard libelle={t("Parents liés", "Linked parents")} valeur={nombre(e.parentsLies, lang)} detail={e.effectifEleves ? t(`${Math.round((e.parentsLies / e.effectifEleves) * 100)} % des élèves`, `${Math.round((e.parentsLies / e.effectifEleves) * 100)}% of students`) : undefined} ton="succes" />
        <StatCard libelle={t("Abonnement", "Subscription")} valeur={lib(PLAN, e.plan, t)} detail={`${t("Valide jusqu'au", "Valid until")} ${dateCourte(e.finAbonnement, lang)}`} ton="alerte" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader titre={t("Compte du directeur", "Principal account")} />
          {e.directeur ? (
            <>
              <Personne nom={`${e.directeur.civilite} ${e.directeur.prenom} ${e.directeur.nom}`} detail={t("Administrateur de l'établissement", "School administrator")} />
              <dl className="mt-4 space-y-1.5 text-sm">
                <div className="flex justify-between"><dt className="text-muted">{t("Courriel", "Email")}</dt><dd>{e.directeur.email}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">{t("Dernière connexion", "Last sign-in")}</dt><dd>{derniereConnexion(e.directeur.derniereConnexion, lang)}</dd></div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                <ActionButton action={actionCompte.bind(null, e.directeur.id, "renvoyer")}>{t("Renvoyer l'invitation", "Resend invitation")}</ActionButton>
                <ActionButton action={actionCompte.bind(null, e.directeur.id, "reinitialiser")} confirmation={t("Envoyer un lien de réinitialisation au directeur ?", "Send a reset link to the principal?")}>{t("Réinitialiser le mot de passe", "Reset password")}</ActionButton>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">{t("Aucun directeur.", "No principal.")}</p>
          )}
        </Card>
        <Card>
          <CardHeader titre={t("Accès support", "Support access")} sousTitre={t("Accès en lecture seule", "Read-only access")} />
          <p className="text-sm text-muted">{t("Permet au support de voir les données de l'école pour aider, sans jamais pouvoir les modifier. Chaque consultation est enregistrée dans le journal d'audit de la plateforme.", "Lets support see the school's data to help, without ever changing it. Every access is recorded in the platform audit log.")}</p>
          <ActionButton action={ouvrirAccesSupport.bind(null, e.id)} variante="primaire" taille="md" className="mt-4">
            <Eye className="size-4" /> {t("Ouvrir l'école (lecture seule)", "Open the school (read only)")}
          </ActionButton>
        </Card>
      </div>
      <Card className="border-red-100">
        <CardHeader titre={t("Zone sensible", "Danger zone")} />
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="text-sm">
            <p className="font-semibold">{suspendu ? t("Réactiver l'établissement", "Reactivate the school") : t("Suspendre l'établissement", "Suspend the school")}</p>
            <p className="mb-2 text-muted">{t("Les utilisateurs ne pourront plus se connecter. Les données sont conservées.", "Users will no longer be able to sign in. Data is kept.")}</p>
            <ActionButton action={changerStatutEtablissement.bind(null, e.id, suspendu ? "actif" : "suspendu")} variante={suspendu ? "succes" : "danger"} confirmation={suspendu ? undefined : t("Suspendre cet établissement ?", "Suspend this school?")}>
              {suspendu ? t("Réactiver", "Reactivate") : t("Suspendre", "Suspend")}
            </ActionButton>
          </div>
          <div className="text-sm">
            <p className="font-semibold">{t("Prolonger l'abonnement", "Extend the subscription")}</p>
            <p className="mb-2 text-muted">{t("Ajoute 12 mois à la date de fin actuelle.", "Adds 12 months to the current end date.")}</p>
            <ActionButton action={prolongerAbonnement.bind(null, e.id)} champs={{ mois: "12" }}>{t("Prolonger", "Extend")}</ActionButton>
          </div>
        </div>
      </Card>
    </div>
  );
}
