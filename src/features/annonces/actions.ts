"use server";
// CU-DIR-08 / CU-SUR-07 : seules la direction et la surveillance générale publient des annonces.
import { refresh } from "next/cache";
import { ecrire } from "@/lib/api/client";
import { messageErreur } from "@/lib/api/errors";
import { exigerRole } from "@/lib/auth/dal";
import { getLangAction, getTAction } from "@/lib/i18n/server";
import { echec, erreursZod, lireFormulaire, type EtatFormulaire } from "@/lib/actions";
import * as m from "@/lib/api/mock/communication";
import { schemaAnnonce } from "./schemas";

export async function enregistrerAnnonce(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const s = await exigerRole("direction", "surveillant");
  const t = await getTAction();
  const res = schemaAnnonce.safeParse(lireFormulaire(fd));
  if (!res.success) return echec(t("Vérifiez les champs signalés.", "Please check the highlighted fields."), erreursZod(res.error));
  const auteur = s.role === "direction" ? "direction" : "surveillant";
  try {
    const r = await ecrire(() => m.enregistrerAnnonce(res.data, auteur, s.nomAffiche), "/annonces", "POST", res.data);
    refresh();
    const messages = {
      publiee: t("Annonce publiée : elle part vers les applications mobiles.", "Announcement published to the mobile apps."),
      programmee: t("Annonce programmée.", "Announcement scheduled."),
      brouillon: t("Brouillon enregistré.", "Draft saved."),
    };
    return { ok: true, message: messages[r.statut] };
  } catch (e) {
    return echec(messageErreur(e, await getLangAction()));
  }
}

export async function publierAnnonce(id: string) {
  const s = await exigerRole("direction", "surveillant");
  await ecrire(() => m.publierAnnonce(id, s.nomAffiche), `/annonces/${id}/publier`, "POST");
  refresh();
}

export async function supprimerAnnonce(id: string) {
  const s = await exigerRole("direction", "surveillant");
  await ecrire(() => m.supprimerAnnonce(id, s.nomAffiche), `/annonces/${id}`, "DELETE");
  refresh();
}
