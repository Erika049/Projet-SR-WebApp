"use server";
// CU-SUR-03 : valider ou refuser un justificatif d'absence. Le parent est notifié de chaque décision.
import { refresh } from "next/cache";
import * as b from "@/lib/api/backend";
import { exigerRole } from "@/lib/auth/dal";

/** [fd] peut contenir « commentaire » (transmis au parent avec la décision). */
export async function traiterJustificatif(id: string, decision: "accepte" | "refuse", fd?: FormData) {
  await exigerRole("surveillant");
  const commentaire = String(fd?.get("commentaire") ?? "").trim();
  await b.traiterJustificatif(id, decision, commentaire);
  refresh();
}
