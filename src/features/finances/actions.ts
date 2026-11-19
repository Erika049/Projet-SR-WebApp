"use server";
// Économat : encaissement avec reçu, annulation, relances des impayés, déclarations des parents (CU-ECO-01..08).
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import * as b from "@/lib/api/backend";
import { messageErreur } from "@/lib/api/errors";
import { exigerRole } from "@/lib/auth/dal";
import { getLangAction, getTAction } from "@/lib/i18n/server";
import { echec, type EtatFormulaire } from "@/lib/actions";

const MODES = ["ESPECES", "MOBILE_MONEY", "VIREMENT", "CHEQUE"] as const;

export async function enregistrerPaiement(eleveId: string, _: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  await exigerRole("comptable", "direction");
  const t = await getTAction();
  const lang = await getLangAction();
  const montant = Number(String(fd.get("montant") ?? "").replace(/[\s ]/g, "").replace(",", "."));
  const mode = String(fd.get("mode") ?? "") as (typeof MODES)[number];
  const reference = String(fd.get("reference") ?? "").trim() || null;
  const date = String(fd.get("date") ?? "");
  const erreurs: Record<string, string> = {};
  if (!(montant > 0)) erreurs.montant = t("Montant invalide.", "Invalid amount.");
  if (!MODES.includes(mode)) erreurs.mode = t("Choisissez le mode.", "Choose the method.");
  if (mode !== "ESPECES" && !reference) erreurs.reference = t("Référence de la transaction obligatoire.", "Transaction reference required.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) erreurs.date = t("Date invalide.", "Invalid date.");
  if (Object.keys(erreurs).length) return echec(t("Vérifiez les champs signalés.", "Please check the highlighted fields."), erreurs);
  let id: string;
  try {
    id = (await b.enregistrerPaiement(eleveId, { montant, mode, reference, date })).id;
  } catch (e) {
    return echec(messageErreur(e, lang));
  }
  redirect(`/${lang}/comptabilite/paiements/${id}?nouveau=1`);
}

export async function annulerPaiement(eleveId: string, paiementId: string, _: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  await exigerRole("comptable", "direction");
  const t = await getTAction();
  const motif = String(fd.get("motif") ?? "").trim();
  if (!motif) return echec(t("Indiquez le motif de l'annulation.", "Give the reason for the cancellation."));
  try {
    await b.annulerPaiement(eleveId, paiementId, motif);
    refresh();
    return { ok: true, message: t("Paiement annulé. Les parents sont prévenus.", "Payment cancelled. The parents are notified.") };
  } catch (e) {
    return echec(messageErreur(e, await getLangAction()));
  }
}

export async function relancerImpayes(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  await exigerRole("comptable", "direction");
  const t = await getTAction();
  const eleveId = String(fd.get("eleveId") ?? "");
  try {
    const r = await b.relancerImpayes(eleveId ? [eleveId] : undefined);
    refresh();
    return {
      ok: true,
      message: t(
        `${r.notificationsEnvoyees} relance(s) envoyée(s) à ${r.elevesRelances} famille(s).${r.elevesSansParentLie ? ` ${r.elevesSansParentLie} élève(s) sans parent lié.` : ""}`,
        `${r.notificationsEnvoyees} reminder(s) sent to ${r.elevesRelances} family(ies).${r.elevesSansParentLie ? ` ${r.elevesSansParentLie} student(s) without a linked parent.` : ""}`,
      ),
    };
  } catch (e) {
    return echec(messageErreur(e, await getLangAction()));
  }
}

/** Valider émet le reçu (paiement enregistré) ; rejeter transmet [fd].motif au parent. */
export async function traiterDeclaration(id: string, decision: "valider" | "rejeter", fd?: FormData) {
  await exigerRole("comptable");
  const motif = String(fd?.get("motif") ?? "").trim();
  await b.traiterDeclaration(id, decision, motif);
  refresh();
}
