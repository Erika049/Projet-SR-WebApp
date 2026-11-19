"use server";
// CU-SEC-05 : valider ou rejeter une demande de liaison parent-enfant (code saisi dans l'application mobile).
import { refresh } from "next/cache";
import * as b from "@/lib/api/backend";
import { exigerRole } from "@/lib/auth/dal";

export async function traiterLiaison(id: string, eleveId: string, decision: "accepter" | "refuser") {
  await exigerRole("secretariat", "direction");
  await b.traiterLiaison(id, eleveId, decision);
  refresh();
}
