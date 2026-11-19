"use server";
// CU-SEC-05 : valider ou rejeter une demande de liaison parent-enfant.
import { refresh } from "next/cache";
import { ecrire } from "@/lib/api/client";
import { exigerRole } from "@/lib/auth/dal";
import * as m from "@/lib/api/mock/scolarite";

export async function traiterLiaison(id: string, decision: "accepter" | "refuser") {
  const s = await exigerRole("secretariat");
  await ecrire(() => m.traiterLiaison(id, decision, s.nomAffiche), `/liaisons/demandes/${id}/${decision}`, "POST");
  refresh();
}
