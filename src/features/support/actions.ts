"use server";
// Demande d'assistance envoyée par un établissement au support SchoolConnect.
import { refresh } from "next/cache";
import { z } from "zod";
import { ecrire } from "@/lib/api/client";
import { exigerRole } from "@/lib/auth/dal";
import { getTAction } from "@/lib/i18n/server";
import { echec, erreursZod, lireFormulaire, type EtatFormulaire } from "@/lib/actions";
import * as c from "@/lib/api/mock/communication";

const schema = z.object({
  type: z.enum(["bug", "question", "demande"]),
  module: z.string().min(1),
  objet: z.string().trim().min(4, "Objet trop court / Subject too short"),
  description: z.string().trim().min(10, "Décrivez le problème (10 caractères min.) / Describe the issue (10 chars min.)"),
});

export async function creerTicket(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const s = await exigerRole("direction", "secretariat", "surveillant", "comptable");
  const t = await getTAction();
  const res = schema.safeParse(lireFormulaire(fd));
  if (!res.success) return echec(t("Vérifiez les champs signalés.", "Please check the highlighted fields."), erreursZod(res.error));
  const r = await ecrire(() => c.creerTicket(res.data, s.etablissementId!, s.nomAffiche), "/support/tickets", "POST", res.data);
  refresh();
  return { ok: true, message: t(`Demande #${r.numero} envoyée au support.`, `Request #${r.numero} sent to support.`) };
}
