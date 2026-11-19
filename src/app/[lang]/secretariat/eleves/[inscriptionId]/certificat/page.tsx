// Route : /[lang]/secretariat/eleves/[inscriptionId]/certificat — Certificat de scolarité imprimable (CU-SEC-08).
import { notFound } from "next/navigation";
import { getLang, getT } from "@/lib/i18n/server";
import { dateCourte, dateLongue, aujourdhuiIso } from "@/lib/format";
import { getEleve } from "@/features/eleves/queries";
import { getEtablissement } from "@/features/plateforme/queries";
import { getCurrentUser } from "@/lib/auth/dal";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { DocumentOfficiel } from "@/components/documents/document";

export default async function CertificatPage({ params }: PageProps<"/[lang]/secretariat/eleves/[inscriptionId]/certificat">) {
  const { inscriptionId } = await params;
  const [t, lang, e, session] = await Promise.all([getT(), getLang(), getEleve(inscriptionId), getCurrentUser()]);
  if (!e) notFound();
  const etab = (await getEtablissement(session.etablissementId!))!;
  const aujourdhui = aujourdhuiIso();
  return (
    <>
      <PageHeader titre={t("Certificat de scolarité", "School certificate")} filAriane={[{ href: `/${lang}/secretariat/eleves/${e.id}`, libelle: `${e.prenom} ${e.nom}` }]} />
      <PageBody>
        <DocumentOfficiel etablissement={etab} titre={t("Certificat de scolarité", "Certificate of school attendance")} reference={`N° CS-${e.matricule}`} libelleImprimer={t("Imprimer", "Print")}>
          <p>
            {t("Je soussigné, le Proviseur du", "I, the undersigned, Principal of")} <strong>{etab.nom}</strong>, {t("certifie que l'élève :", "certify that the student:")}
          </p>
          <div className="my-6 rounded-xl bg-slate-50 p-5">
            <p className="text-lg font-bold">{e.nom.toUpperCase()} {e.prenom}</p>
            <p>{t("Né(e) le", "Born on")} {dateCourte(e.dateNaissance, lang)} {e.lieuNaissance && `${t("à", "in")} ${e.lieuNaissance}`}</p>
            <p>{t("Matricule", "Student ID")} : {e.matricule}</p>
          </div>
          <p>
            {t("est régulièrement inscrit(e) en classe de", "is duly enrolled in")} <strong>{e.classe.libelle}</strong> {t("au titre de l'année scolaire", "for the school year")} <strong>2026-2027</strong>.
          </p>
          <p className="mt-4">{t("En foi de quoi, le présent certificat lui est délivré pour servir et valoir ce que de droit.", "This certificate is issued to serve whatever purpose it may.")}</p>
          <div className="mt-12 flex justify-between">
            <p>{t("Fait à", "Done at")} {etab.ville}, {dateLongue(aujourdhui, lang).toLowerCase()}</p>
            <p className="text-center">
              {t("Le Proviseur", "The Principal")}
              <br />
              <span className="mt-16 block text-xs text-muted">({t("signature et cachet", "signature and stamp")})</span>
            </p>
          </div>
        </DocumentOfficiel>
      </PageBody>
    </>
  );
}
