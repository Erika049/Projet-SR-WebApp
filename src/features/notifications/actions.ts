"use server";
import { refresh } from "next/cache";
import { ecrire } from "@/lib/api/client";
import { getSession } from "@/lib/auth/session";
import { getTAction } from "@/lib/i18n/server";
import type { EtatFormulaire } from "@/lib/actions";
import * as m from "@/lib/api/mock/communication";

async function session() {
  const s = await getSession();
  if (!s) throw new Error("Session expirée / Session expired");
  return s;
}

export async function marquerToutLu() {
  const s = await session();
  await ecrire(() => m.marquerToutLu(s.role), "/notifications/tout-lu", "POST");
  refresh();
}

export async function marquerLue(id: string) {
  const s = await session();
  await ecrire(() => m.marquerLue(id, s.role), `/notifications/${id}/lue`, "POST");
  refresh();
}

export async function archiver(id: string) {
  const s = await session();
  await ecrire(() => m.archiverNotification(id, s.role), `/notifications/${id}/archiver`, "POST");
  refresh();
}

export async function enregistrerPreferences(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const s = await session();
  const t = await getTAction();
  const actifs = fd.getAll("type").map(String);
  await ecrire(() => m.enregistrerPreferences(s.userId, s.role, actifs), "/notifications/preferences", "PUT", { actifs });
  refresh();
  return { ok: true, message: t("Préférences enregistrées.", "Preferences saved.") };
}
