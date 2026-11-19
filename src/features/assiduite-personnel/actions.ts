"use server";
// CU-SUR-05 : enregistrer l'assiduité des enseignants et du personnel.
import { refresh } from "next/cache";
import { ecrire } from "@/lib/api/client";
import { exigerRole } from "@/lib/auth/dal";
import { getTAction } from "@/lib/i18n/server";
import type { EtatFormulaire } from "@/lib/actions";
import * as m from "@/lib/api/mock/personnel";
import type { PresencePersonnel } from "@/types/domain";

export async function saisirPresencePersonnel(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const s = await exigerRole("surveillant");
  const t = await getTAction();
  const valeurs: Record<string, PresencePersonnel> = {};
  for (const [k, v] of fd.entries()) if (k.startsWith("p_") && (v === "P" || v === "A" || v === "R")) valeurs[k.slice(2)] = v;
  await ecrire(() => m.saisirPresencePersonnel(valeurs, s.nomAffiche), "/personnel/presences/jour", "PUT", valeurs);
  refresh();
  return { ok: true, message: t("Appel du personnel enregistré.", "Staff roll call saved.") };
}
