"use server";
// CU-DIR-05 : valider les résultats et publier les bulletins. À la publication, les parents sont notifiés.
import { refresh } from "next/cache";
import { ecrire } from "@/lib/api/client";
import { messageErreur } from "@/lib/api/errors";
import { exigerRole } from "@/lib/auth/dal";
import { getLangAction, getTAction } from "@/lib/i18n/server";
import { echec, type EtatFormulaire } from "@/lib/actions";
import * as m from "@/lib/api/mock/notes";

export async function actionGroupee(sequence: number, _: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const s = await exigerRole("direction");
  const t = await getTAction();
  const ids = fd.getAll("classeId").map(String);
  const action = String(fd.get("action") ?? "");
  try {
    if (action === "generer") {
      const r = await ecrire(() => m.genererBulletins(sequence, s.nomAffiche), `/bulletins/sequences/${sequence}/generer`, "POST");
      refresh();
      return { ok: true, message: t(`${r.n} classe(s) prête(s) à valider.`, `${r.n} class(es) ready for approval.`) };
    }
    if (action === "cloturer") {
      await ecrire(() => m.cloturerSaisie(sequence, s.nomAffiche), `/bulletins/sequences/${sequence}/cloturer`, "POST");
      refresh();
      return { ok: true, message: t("Saisie clôturée : les enseignants ne peuvent plus modifier les notes.", "Entry closed: teachers can no longer change marks.") };
    }
    if (!ids.length) return echec(t("Sélectionnez au moins une classe.", "Select at least one class."));
    if (action === "valider") {
      const r = await ecrire(() => m.validerBulletins(ids, sequence, s.nomAffiche), `/bulletins/sequences/${sequence}/valider`, "POST", { classeIds: ids });
      refresh();
      return { ok: true, message: t(`${r.n} classe(s) validée(s).`, `${r.n} class(es) approved.`) };
    }
    const r = await ecrire(() => m.publierBulletins(ids, sequence, s.nomAffiche), `/bulletins/sequences/${sequence}/publier`, "POST", { classeIds: ids });
    refresh();
    return { ok: true, message: t(`${r.n} classe(s) publiée(s). Les parents sont notifiés.`, `${r.n} class(es) published. Parents are notified.`) };
  } catch (e) {
    return echec(messageErreur(e, await getLangAction()));
  }
}

export async function validerClasse(classeId: string, sequence: number) {
  const s = await exigerRole("direction");
  await ecrire(() => m.validerBulletins([classeId], sequence, s.nomAffiche), `/bulletins/sequences/${sequence}/valider`, "POST", { classeIds: [classeId] });
  refresh();
}

export async function publierClasse(classeId: string, sequence: number) {
  const s = await exigerRole("direction");
  await ecrire(() => m.publierBulletins([classeId], sequence, s.nomAffiche), `/bulletins/sequences/${sequence}/publier`, "POST", { classeIds: [classeId] });
  refresh();
}

export async function relancerEnseignants(classeId: string) {
  const s = await exigerRole("direction");
  await ecrire(() => m.relancerEnseignants(classeId, s.nomAffiche), `/bulletins/classes/${classeId}/relance`, "POST");
  refresh();
}
