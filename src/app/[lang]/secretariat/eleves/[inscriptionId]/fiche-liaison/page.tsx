// Route : /[lang]/secretariat/eleves/[inscriptionId]/fiche-liaison — Fiche remise au parent avec son code de liaison (CU-SEC-04).
import { notFound } from "next/navigation";
import { getLang, getT } from "@/lib/i18n/server";
import { dateCourte } from "@/lib/format";
import { dossier, etablissement, getEtablissement } from "@/lib/api/backend";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { DocumentOfficiel } from "@/components/documents/document";
import { EmptyState } from "@/components/ui/empty-state";

export default async function FicheLiaisonPage({ params }: PageProps<"/[lang]/secretariat/eleves/[inscriptionId]/fiche-liaison">) {
  const { inscriptionId } = await params;
  const [t, lang, d] = await Promise.all([getT(), getLang(), dossier(inscriptionId)]);
  if (!d) notFound();
  const etab = await getEtablissement(await etablissement());
  const e = d.eleve;
  const code = d.codes.find((c) => !c.utilise && !c.expire);
  return (
    <>
      <PageHeader titre={t("Fiche de liaison", "Link sheet")} filAriane={[{ href: `/${lang}/secretariat/eleves/${e.eleveId}`, libelle: `${e.prenom} ${e.nom}` }]} />
      <PageBody>
        {!code ? (
          <EmptyState titre={t("Aucun code de liaison valide", "No valid link code")} texte={t("Enregistrez le tuteur dans le dossier pour générer un code.", "Record the guardian in the file to generate a code.")} />
        ) : (
          <DocumentOfficiel
            etablissement={{ nom: etab.nom, adresse: etab.adresse ?? etab.ville ?? "", telephone: etab.telephone ?? "", email: etab.email ?? "" }}
            titre={t("Fiche de liaison parent", "Parent link sheet")}
            reference={`${e.matricule} · ${e.classeNom ?? ""}`}
            libelleImprimer={t("Imprimer", "Print")}
          >
            <p>{t("Madame, Monsieur,", "Dear parent,")}</p>
            <p className="mt-3">
              {t("Suivez la scolarité de", "Follow the schooling of")} <strong>{e.prenom} {e.nom}</strong> {t("(présences, notes, paiements, annonces) avec l'application mobile SchoolConnect.", "(attendance, marks, payments, announcements) with the SchoolConnect mobile app.")}
            </p>
            <ol className="mt-4 list-inside list-decimal space-y-1">
              <li>{t("Installez l'application SchoolConnect et créez votre compte avec votre numéro de téléphone.", "Install the SchoolConnect app and create your account with your phone number.")}</li>
              <li>{t("Ouvrez « Enfants » puis « Lier un enfant ».", "Open “Children”, then “Link a child”.")}</li>
              <li>{t("Saisissez le code ci-dessous. Le secrétariat valide ensuite votre demande.", "Enter the code below. The secretariat then approves your request.")}</li>
            </ol>
            <p className="my-8 rounded-xl border-2 border-dashed border-navy-700 py-5 text-center font-mono text-4xl font-bold tracking-[0.4em] text-navy-800">{code.code}</p>
            <p className="text-center text-xs text-muted">
              {t("Code personnel, utilisable une seule fois, valable jusqu'au", "Personal code, single use, valid until")} {dateCourte(code.expireLe, lang)}.
            </p>
          </DocumentOfficiel>
        )}
      </PageBody>
    </>
  );
}
