"use server";
// CU-SUR-02 (appel de rattrapage) et CU-SUR-04 (retards et sorties anticipées). Les parents sont notifiés (CU-SYS-01).
import { refresh } from "next/cache";
import { ecrire } from "@/lib/api/client";
import { messageErreur } from "@/lib/api/errors";
import { exigerRole } from "@/lib/auth/dal";
import { getLangAction, getTAction } from "@/lib/i18n/server";
import { echec, type EtatFormulaire } from "@/lib/actions";
import * as m from "@/lib/api/mock/vie-scolaire";
import type { StatutPresence } from "@/types/domain";

export async function enregistrerAppel(classeId: string, _: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const s = await exigerRole("surveillant");
  const t = await getTAction();
  const statuts: Record<string, StatutPresence> = {};
  for (const [k, v] of fd.entries()) {
    if (k.startsWith("statut_") && (v === "present" || v === "absent" || v === "retard")) statuts[k.slice(7)] = v;
  }
  try {
    const r = await ecrire(() => m.enregistrerAppel(classeId, statuts, s.nomAffiche), `/presences/classes/${classeId}/appel`, "PUT", statuts);
    refresh();
    return { ok: true, message: t(`Appel enregistré. ${r.notifies} parent(s) notifié(s).`, `Roll call saved. ${r.notifies} parent(s) notified.`) };
  } catch (e) {
    return echec(messageErreur(e, await getLangAction()));
  }
}

export async function relancerAppel(classeId: string) {
  const s = await exigerRole("surveillant");
  await ecrire(() => m.relancerAppel(classeId, s.nomAffiche), `/presences/classes/${classeId}/relance`, "POST");
  refresh();
}

export async function enregistrerRetardSortie(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const s = await exigerRole("surveillant");
  const t = await getTAction();
  const data = {
    eleveId: String(fd.get("eleveId") ?? ""),
    type: fd.get("type") === "sortie" ? ("sortie" as const) : ("retard" as const),
    heure: String(fd.get("heure") ?? ""),
    motif: String(fd.get("motif") ?? "").trim(),
  };
  const erreurs: Record<string, string> = {};
  if (!data.eleveId) erreurs.eleveId = t("Choisissez un élève.", "Choose a student.");
  if (!/^\d\d:\d\d$/.test(data.heure)) erreurs.heure = t("Heure invalide.", "Invalid time.");
  if (Object.keys(erreurs).length) return echec(t("Vérifiez les champs signalés.", "Please check the highlighted fields."), erreurs);
  try {
    await ecrire(() => m.enregistrerRetardSortie(data, s.nomAffiche), "/presences/retards-sorties", "POST", data);
    refresh();
    return { ok: true, message: t("Enregistré. Le parent est notifié automatiquement.", "Saved. The parent is notified automatically.") };
  } catch (e) {
    return echec(messageErreur(e, await getLangAction()));
  }
}
