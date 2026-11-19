"use server";
// Vie scolaire : appel de rattrapage, vérification des fiches soumises par les enseignants, retards et sorties.
// Les parents sont prévenus par notification dans l'application mobile (CU-SYS-01).
import { refresh } from "next/cache";
import * as b from "@/lib/api/backend";
import { messageErreur } from "@/lib/api/errors";
import { exigerRole } from "@/lib/auth/dal";
import { getLangAction, getTAction } from "@/lib/i18n/server";
import { echec, type EtatFormulaire } from "@/lib/actions";
import type { StatutPresence } from "@/types/domain";

export async function enregistrerAppel(classeId: string, _: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  await exigerRole("surveillant", "direction");
  const t = await getTAction();
  const statuts: Record<string, StatutPresence> = {};
  for (const [k, v] of fd.entries()) {
    if (k.startsWith("statut_") && (v === "present" || v === "absent" || v === "retard")) statuts[k.slice(7)] = v;
  }
  try {
    const r = await b.enregistrerAppel(classeId, statuts);
    refresh();
    return { ok: true, message: t(`Appel enregistré. Parents prévenus pour ${r.notifies} élève(s).`, `Roll call saved. Parents notified for ${r.notifies} student(s).`) };
  } catch (e) {
    return echec(messageErreur(e, await getLangAction()));
  }
}

/** Le surveillant général a vérifié la fiche d'appel soumise par l'enseignant : les parents des absents sont prévenus. */
export async function notifierParentsAppel(classeId: string, appelId: string): Promise<EtatFormulaire> {
  await exigerRole("surveillant", "direction");
  const t = await getTAction();
  try {
    const r = await b.notifierParents(classeId, appelId);
    refresh();
    const sansParent = r.elevesSansParent
      ? t(` ${r.elevesSansParent} élève(s) sans parent lié : contactez la famille.`, ` ${r.elevesSansParent} student(s) without a linked parent: contact the family.`)
      : "";
    return {
      ok: true,
      message:
        t(
          `Parents prévenus pour ${r.elevesConcernes} élève(s) (${r.notificationsEnvoyees} notification(s)).`,
          `Parents notified for ${r.elevesConcernes} student(s) (${r.notificationsEnvoyees} notification(s)).`,
        ) + sansParent,
    };
  } catch (e) {
    return echec(messageErreur(e, await getLangAction()));
  }
}

/** CU-SUR-04 : retard ou sortie anticipée ; l'appel du jour de la classe est complété et les parents prévenus. */
export async function enregistrerRetardSortie(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  await exigerRole("surveillant");
  const t = await getTAction();
  const [eleveId, classeId] = String(fd.get("eleve") ?? "").split("|");
  const type = fd.get("type") === "sortie" ? "sortie" : "retard";
  const heure = String(fd.get("heure") ?? "");
  const erreurs: Record<string, string> = {};
  if (!eleveId || !classeId) erreurs.eleve = t("Choisissez un élève.", "Choose a student.");
  if (!/^\d\d:\d\d$/.test(heure)) erreurs.heure = t("Heure invalide.", "Invalid time.");
  if (Object.keys(erreurs).length) return echec(t("Vérifiez les champs signalés.", "Please check the highlighted fields."), erreurs);
  try {
    await b.enregistrerRetardSortie(eleveId, classeId, type, heure);
    refresh();
    return { ok: true, message: t("Enregistré. Les parents sont prévenus.", "Saved. The parents are notified.") };
  } catch (e) {
    return echec(messageErreur(e, await getLangAction()));
  }
}
