// Route : /[lang]/secretariat/eleves/[inscriptionId]/fiche-liaison — Fiche remise au parent avec son code de liaison (CU-SEC-04).
import { notFound } from "next/navigation";
import { getLang, getT } from "@/lib/i18n/server";
import { getEleve } from "@/features/eleves/queries";
import { getEtablissement } from "@/features/plateforme/queries";
import { getCurrentUser } from "@/lib/auth/dal";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { DocumentOfficiel } from "@/components/documents/document";

export default async function FicheLiaisonPage({ params }: PageProps<"/[lang]/secretariat/eleves/[inscriptionId]/fiche-liaison">) {
  const { inscriptionId } = await params;
  const [t, lang, e, session] = await Promise.all([getT(), getLang(), getEleve(inscriptionId), getCurrentUser()]);
  if (!e) notFound();
  const etab = (await getEtablissement(session.etablissementId!))!;
  return (
    <>
      <PageHeader titre={t("Fiche de liaison", "Link sheet")} filAriane={[{ href: `/${lang}/secretariat/eleves/${e.id}`, libelle: `${e.prenom} ${e.nom}` }]} />
      <PageBody>
        <DocumentOfficiel etablissement={etab} titre={t("Fiche de liaison parent", "Parent link sheet")} libelleImprimer={t("Imprimer", "Print")}>
          <p>
            {t("Madame, Monsieur", "Dear parent")} <strong>{e.tuteur.nom}</strong>,
          </p>
          <p className="mt-3">
            {t(
              "Pour suivre la scolarité de votre enfant (présences, notes, bulletins, paiements), installez l'application SchoolConnect sur votre téléphone, créez votre compte, puis saisissez le code ci-dessous.",
              "To follow your child's schooling (attendance, marks, report cards, payments), install the SchoolConnect app on your phone, create your account, then enter the code below.",
            )}
          </p>
          <div className="my-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-xs uppercase text-muted">{t("Élève", "Student")}</p>
              <p className="font-bold">{e.prenom} {e.nom}</p>
              <p>{e.classe.libelle} · {e.matricule}</p>
            </div>
            <div className="rounded-xl border-2 border-dashed border-navy-700 p-5 text-center">
              <p className="text-xs uppercase text-muted">{t("Code de liaison", "Link code")}</p>
              <p className="mt-1 font-mono text-3xl font-bold tracking-widest text-navy-800">{e.codeLiaison}</p>
              <p className="mt-1 text-xs text-muted">{t("Usage unique · personnel", "Single use · personal")}</p>
            </div>
          </div>
          <ol className="list-decimal space-y-1 pl-5">
            <li>{t("Téléchargez « SchoolConnect » sur le Play Store.", "Download “SchoolConnect” from the Play Store.")}</li>
            <li>{t("Créez votre compte avec votre numéro de téléphone.", "Create your account with your phone number.")}</li>
            <li>{t("Touchez « Lier un enfant » et saisissez le code.", "Tap “Link a child” and enter the code.")}</li>
            <li>{t("L'établissement valide votre demande : vous êtes notifié.", "The school approves your request: you are notified.")}</li>
          </ol>
          <p className="mt-6 text-xs text-muted">
            {t("Ne communiquez ce code à personne. En cas de perte, adressez-vous au secrétariat.", "Do not share this code. If lost, contact the secretariat.")}
          </p>
        </DocumentOfficiel>
      </PageBody>
    </>
  );
}
