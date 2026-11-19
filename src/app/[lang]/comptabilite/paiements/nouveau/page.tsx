// Route : /[lang]/comptabilite/paiements/nouveau — Enregistrer un paiement (CU-ECO-02, CU-ECO-03).
// Étape 1 : rechercher l'élève (?q=) ; étape 2 : saisir le paiement (?eleve=).
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLang, getT } from "@/lib/i18n/server";
import { dateCourte, fcfa } from "@/lib/format";
import { texteRecherche } from "@/lib/api/pagination";
import { premier } from "@/lib/utils";
import { getSituation } from "@/features/finances/queries";
import { PaiementForm } from "@/features/finances/components/paiement-form";
import { RechercheEleve } from "@/features/finances/components/recherche-eleve";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Personne } from "@/components/ui/avatar";

export default async function EnregistrerPaiementPage({ searchParams }: PageProps<"/[lang]/comptabilite/paiements/nouveau">) {
  const [sp, t, lang] = await Promise.all([searchParams, getT(), getLang()]);
  const eleveId = premier(sp.eleve);
  const base = `/${lang}/comptabilite/paiements/nouveau`;

  if (!eleveId) {
    return (
      <>
        <PageHeader titre={t("Enregistrer un paiement", "Record a payment")} sousTitre={t("Recherchez d'abord l'élève.", "First find the student.")} />
        <PageBody>
          <RechercheEleve q={texteRecherche(sp.q)} lien={(id) => `/comptabilite/paiements/nouveau?eleve=${id}`} libelleLien={t("Choisir", "Select")} />
        </PageBody>
      </>
    );
  }

  const s = await getSituation(eleveId);
  if (!s) notFound();
  return (
    <>
      <PageHeader titre={t("Enregistrer un paiement", "Record a payment")} sousTitre={t("Le parent reçoit le reçu dans l'application mobile.", "The parent receives the receipt in the mobile app.")} />
      <PageBody>
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Personne nom={`${s.eleve.prenom} ${s.eleve.nom}`} detail={`${s.eleve.matricule} · ${s.classe?.libelle} · ${t("Tuteur", "Guardian")} : ${s.eleve.tuteur.nom}`} />
            <div className="flex gap-6 text-sm">
              <div><p className="text-muted">{t("Frais dus", "Fees due")}</p><p className="font-bold">{fcfa(s.totalDu, lang)}</p></div>
              <div><p className="text-muted">{t("Payé", "Paid")}</p><p className="font-bold text-brand-700">{fcfa(s.paye, lang)}</p></div>
              <div><p className="text-muted">{t("Solde", "Balance")}</p><p className="font-bold text-red-600">{fcfa(s.solde, lang)}</p></div>
            </div>
            <Link href={base} className="text-sm font-semibold text-navy-700 hover:underline">{t("Changer d'élève", "Change student")}</Link>
          </div>
          {s.prochaineEcheance && (
            <p className="mt-3 rounded-lg bg-navy-50 px-3 py-2 text-sm text-navy-800">
              {t("Prochaine échéance", "Next due date")} : {s.prochaineEcheance.libelle} · {fcfa(s.prochaineEcheance.montant, lang)} {t("avant le", "before")} {dateCourte(s.prochaineEcheance.dateLimite, lang)}
            </p>
          )}
        </Card>
        {s.solde === 0 ? (
          <Card><p className="text-center font-semibold text-brand-700">{t("Cet élève est à jour : aucun montant restant.", "This student is up to date: nothing left to pay.")}</p></Card>
        ) : (
          <PaiementForm
            eleve={{ id: s.eleve.id, nom: `${s.eleve.prenom} ${s.eleve.nom}`, classe: s.classe?.libelle ?? "", solde: s.solde, suggestion: s.montantEchu || s.prochaineEcheance?.montant || s.solde }}
            etablissement="Lycée bilingue de Bafoussam"
          />
        )}
      </PageBody>
    </>
  );
}
