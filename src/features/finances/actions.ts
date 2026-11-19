"use server";
// Économat (CU-ECO-01..09) et pilotage financier de la direction (CU-DIR-04, CU-DIR-07).
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { ecrire } from "@/lib/api/client";
import { messageErreur } from "@/lib/api/errors";
import { exigerRole } from "@/lib/auth/dal";
import { getLangAction, getTAction } from "@/lib/i18n/server";
import { echec, erreursZod, lireFormulaire, type EtatFormulaire } from "@/lib/actions";
import * as m from "@/lib/api/mock/finances";
import { schemaPaiement, schemaRemise, schemaTarif } from "./schemas";

export async function enregistrerPaiement(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const s = await exigerRole("comptable");
  const t = await getTAction();
  const lang = await getLangAction();
  const res = schemaPaiement.safeParse(lireFormulaire(fd));
  if (!res.success) return echec(t("Vérifiez les champs signalés.", "Please check the highlighted fields."), erreursZod(res.error));
  let id: string;
  try {
    ({ id } = await ecrire(() => m.enregistrerPaiement(res.data, s.nomAffiche), "/finances/paiements", "POST", res.data));
  } catch (e) {
    return echec(messageErreur(e, lang));
  }
  redirect(`/${lang}/comptabilite/paiements/${id}?nouveau=1`);
}

export async function demanderAnnulation(id: string, _: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const s = await exigerRole("comptable");
  const t = await getTAction();
  const motif = String(fd.get("motif") ?? "").trim();
  if (motif.length < 5) return echec(t("Indiquez un motif précis.", "Give a precise reason."));
  try {
    await ecrire(() => m.demanderAnnulation(id, motif, s.nomAffiche), `/finances/paiements/${id}/annulation`, "POST", { motif });
    refresh();
    return { ok: true, message: t("Demande d'annulation envoyée à la direction.", "Cancellation request sent to management.") };
  } catch (e) {
    return echec(messageErreur(e, await getLangAction()));
  }
}

export async function traiterAnnulation(id: string, decision: "valider" | "refuser") {
  const s = await exigerRole("direction");
  await ecrire(() => m.traiterAnnulation(id, decision, s.nomAffiche), `/finances/paiements/${id}/annulation/${decision}`, "POST");
  refresh();
}

export async function envoyerRecu(id: string) {
  const s = await exigerRole("comptable");
  await ecrire(() => m.envoyerRecu(id, s.nomAffiche), `/finances/paiements/${id}/recu/envoyer`, "POST");
  refresh();
}

export async function traiterDeclaration(id: string, decision: "valider" | "rejeter") {
  const s = await exigerRole("comptable");
  await ecrire(() => m.traiterDeclaration(id, decision, s.nomAffiche), `/finances/declarations/${id}/${decision}`, "POST");
  refresh();
}

export async function relancerParent(eleveId: string) {
  const s = await exigerRole("comptable");
  await ecrire(() => m.relancer([eleveId], s.nomAffiche), "/finances/relances", "POST", { eleveIds: [eleveId] });
  refresh();
}

export async function relancerTous() {
  const s = await exigerRole("comptable");
  await ecrire(() => m.relancerTous(s.nomAffiche), "/finances/relances/tous", "POST");
  refresh();
}

export async function cloturerCaisse() {
  const s = await exigerRole("comptable");
  await ecrire(() => m.cloturerCaisse(s.nomAffiche), "/finances/caisse/cloturer", "POST");
  refresh();
}

export async function appliquerRemise(eleveId: string, fd: FormData) {
  const s = await exigerRole("comptable");
  const remiseId = String(fd.get("remiseId") ?? "") || null;
  await ecrire(() => m.appliquerRemise(eleveId, remiseId, s.nomAffiche), `/finances/eleves/${eleveId}/remise`, "PUT", { remiseId });
  refresh();
}

export async function enregistrerTarif(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const s = await exigerRole("direction");
  const t = await getTAction();
  const libelles = fd.getAll("vLibelle").map(String);
  const montants = fd.getAll("vMontant").map(String);
  const dates = fd.getAll("vDate").map(String);
  const brut = {
    niveau: fd.get("niveau"),
    montant: fd.get("montant"),
    versements: libelles.map((libelle, i) => ({ libelle, montant: montants[i], dateLimite: dates[i] })).filter((v) => v.libelle && v.montant),
  };
  const res = schemaTarif.safeParse(brut);
  if (!res.success) return echec(t("Vérifiez les montants et les dates.", "Check amounts and dates."), erreursZod(res.error));
  try {
    await ecrire(() => m.enregistrerTarif(res.data, s.nomAffiche), `/finances/tarifs/${encodeURIComponent(res.data.niveau)}`, "PUT", res.data);
    refresh();
    return { ok: true, message: t("Échéancier enregistré.", "Schedule saved.") };
  } catch (e) {
    return echec(messageErreur(e, await getLangAction()));
  }
}

export async function enregistrerRemise(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const s = await exigerRole("direction");
  const t = await getTAction();
  const res = schemaRemise.safeParse(lireFormulaire(fd));
  if (!res.success) return echec(t("Vérifiez les champs signalés.", "Please check the highlighted fields."), erreursZod(res.error));
  await ecrire(() => m.enregistrerRemise(res.data, s.nomAffiche), "/finances/remises", "PUT", res.data);
  refresh();
  return { ok: true, message: t("Remise enregistrée.", "Discount saved.") };
}
