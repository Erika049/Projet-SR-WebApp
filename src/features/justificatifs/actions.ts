"use server";
// CU-SUR-03 : valider ou refuser un justificatif d'absence. Le parent est notifié de chaque décision.
import { refresh } from "next/cache";
import { ecrire } from "@/lib/api/client";
import { exigerRole } from "@/lib/auth/dal";
import * as m from "@/lib/api/mock/vie-scolaire";

export async function traiterJustificatif(id: string, decision: "accepte" | "refuse") {
  const s = await exigerRole("surveillant");
  await ecrire(() => m.traiterJustificatif(id, decision, s.nomAffiche), `/justificatifs/${id}`, "PUT", { decision });
  refresh();
}
