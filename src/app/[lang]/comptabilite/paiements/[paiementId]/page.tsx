// Route : /[lang]/comptabilite/paiements/[paiementId] — Reçu numérique (CU-ECO-03) et demande d'annulation (CU-ECO-07).
import { notFound } from "next/navigation";
import { CheckCircle2, Send } from "lucide-react";
import { getLang, getT } from "@/lib/i18n/server";
import { dateCourte, fcfa, heure } from "@/lib/format";
import { MODE_PAIEMENT, STATUT_PAIEMENT, lib, ton } from "@/lib/labels";
import { premier } from "@/lib/utils";
import { getPaiement } from "@/features/finances/queries";
import { demanderAnnulation, envoyerRecu } from "@/features/finances/actions";
import { AnnulationForm } from "@/features/finances/components/annulation-form";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Note } from "@/components/ui/card";
import { ActionButton } from "@/components/ui/action-button";
import { Dialog } from "@/components/ui/dialog";
import { DocumentOfficiel } from "@/components/documents/document";

export default async function RecuPage({ params, searchParams }: PageProps<"/[lang]/comptabilite/paiements/[paiementId]">) {
  const [{ paiementId }, sp, t, lang] = await Promise.all([params, searchParams, getT(), getLang()]);
  const r = await getPaiement(paiementId);
  if (!r) notFound();
  const { paiement: p, situation: s, etablissement } = r;
  const nouveau = premier(sp.nouveau) === "1";

  return (
    <>
      <PageHeader
        titre={t("Reçu de paiement", "Payment receipt")}
        filAriane={[{ href: `/${lang}/comptabilite/situation/${s.eleve.id}`, libelle: `${s.eleve.prenom} ${s.eleve.nom}` }]}
        actions={<Badge ton={ton(STATUT_PAIEMENT, p.statut)}>{lib(STATUT_PAIEMENT, p.statut, t)}</Badge>}
      />
      <PageBody>
        {nouveau && (
          <p className="flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700">
            <CheckCircle2 className="size-5" /> {t("Paiement enregistré. Le reçu a été envoyé au parent dans l'application mobile.", "Payment saved. The receipt was sent to the parent in the mobile app.")}
          </p>
        )}
        <DocumentOfficiel
          etablissement={etablissement}
          titre={t("Reçu de paiement", "Payment receipt")}
          reference={p.numeroRecu}
          libelleImprimer={t("Imprimer", "Print")}
          actions={
            p.statut === "valide" && (
              <>
                <ActionButton action={envoyerRecu.bind(null, p.id)} taille="md"><Send className="size-4" /> {t("Envoyer au parent", "Send to parent")}</ActionButton>
                <Dialog declencheur={t("Demander l'annulation", "Request cancellation")} titre={t("Annuler ce paiement", "Cancel this payment")} variante="danger" taille="md">
                  <AnnulationForm action={demanderAnnulation.bind(null, p.id)} />
                </Dialog>
              </>
            )
          }
        >
          <dl className="grid grid-cols-[max-content_1fr] gap-x-8 gap-y-3">
            <dt className="text-muted">{t("Date", "Date")}</dt><dd>{dateCourte(p.date, lang)} · {heure(p.date)}</dd>
            <dt className="text-muted">{t("Élève", "Student")}</dt><dd className="font-semibold">{s.eleve.prenom} {s.eleve.nom} · {s.classe?.libelle} · {s.eleve.matricule}</dd>
            <dt className="text-muted">{t("Payé par", "Paid by")}</dt><dd>{s.eleve.tuteur.nom}</dd>
            <dt className="text-muted">{t("Objet", "For")}</dt><dd>{t("Frais de scolarité 2026-2027", "Tuition fees 2026-2027")}</dd>
            <dt className="text-muted">{t("Mode", "Method")}</dt><dd>{lib(MODE_PAIEMENT, p.mode, t)}{p.reference ? ` · ${p.reference}` : ""}</dd>
            <dt className="text-muted">{t("Montant", "Amount")}</dt><dd className="text-xl font-bold text-navy-800">{fcfa(p.montant, lang)}</dd>
            <dt className="text-muted">{t("Solde restant", "Remaining balance")}</dt><dd className="font-semibold">{fcfa(s.solde, lang)}</dd>
            <dt className="text-muted">{t("Encaissé par", "Received by")}</dt><dd>{p.encaissePar}</dd>
          </dl>
          {p.statut === "annule" && <p className="mt-6 rounded-lg bg-red-50 p-3 text-center font-bold uppercase text-red-700">{t("Paiement annulé", "Payment cancelled")} · {p.motifAnnulation}</p>}
          <p className="mt-8 text-center text-xs text-muted">{t("Merci de votre confiance.", "Thank you for your trust.")}</p>
        </DocumentOfficiel>
        {p.statut === "annulation_demandee" && (
          <Note ton="alerte" titre={t("Annulation en attente", "Cancellation pending")}>
            {t(`Motif : ${p.motifAnnulation}. La direction doit valider l'annulation.`, `Reason: ${p.motifAnnulation}. Management must approve the cancellation.`)}
          </Note>
        )}
      </PageBody>
    </>
  );
}
