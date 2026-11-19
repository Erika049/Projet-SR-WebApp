"use server";
// Annonces aux parents (CU-DIR-08, CU-SUR-07) : notification dans l'application mobile des parents ciblés.
import { refresh } from "next/cache";
import * as b from "@/lib/api/backend";
import { messageErreur } from "@/lib/api/errors";
import { exigerRole } from "@/lib/auth/dal";
import { getLangAction, getTAction } from "@/lib/i18n/server";
import { echec, type EtatFormulaire } from "@/lib/actions";

export async function publierAnnonce(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  await exigerRole("direction", "surveillant", "secretariat");
  const t = await getTAction();
  const titre = String(fd.get("titre") ?? "").trim();
  const message = String(fd.get("message") ?? "").trim();
  const classeId = String(fd.get("classeId") ?? "") || null;
  const erreurs: Record<string, string> = {};
  if (!titre) erreurs.titre = t("Obligatoire.", "Required.");
  if (!message) erreurs.message = t("Obligatoire.", "Required.");
  if (Object.keys(erreurs).length) return echec(t("Vérifiez les champs signalés.", "Please check the highlighted fields."), erreurs);
  try {
    const a = await b.publierAnnonce({ titre, message, classeId });
    refresh();
    return { ok: true, message: t(`Annonce envoyée à ${a.destinataires} parent(s).`, `Announcement sent to ${a.destinataires} parent(s).`) };
  } catch (e) {
    return echec(messageErreur(e, await getLangAction()));
  }
}
