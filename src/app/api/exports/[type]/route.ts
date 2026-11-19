// Route Handler : exports compatibles Excel (CSV UTF-8 avec BOM, séparateur « ; ») — CU-DIR-09, CU-ECO-09.
// Les données sont lues dans le backend SchoolConnect avec le jeton de la session.
import { getSession } from "@/lib/auth/session";
import { aujourdhuiIso } from "@/lib/format";
import { impayes, journalCaisse, repertoire } from "@/lib/api/backend";
import type { Role } from "@/types/domain";

type Table = { entetes: string[]; lignes: (string | number)[][] };

const DATE = /^\d{4}-\d{2}-\d{2}$/;

const EXPORTS: Record<string, { roles: Role[]; fichier: string; construire: (p: URLSearchParams) => Promise<Table> }> = {
  eleves: {
    roles: ["direction", "secretariat"],
    fichier: "eleves",
    construire: async () => ({
      entetes: ["Matricule", "Nom", "Prénom", "Sexe", "Date de naissance", "Classe", "Accès parent"],
      lignes: (await repertoire()).map((e) => [e.matricule, e.nom, e.prenom, e.sexe, e.dateNaissance, e.classeNom ?? "", e.liaison]),
    }),
  },
  impayes: {
    roles: ["direction", "comptable"],
    fichier: "impayes",
    construire: async () => ({
      entetes: ["Nom", "Prénom", "Total dû", "Total payé", "Reste"],
      lignes: (await impayes()).map((i) => [i.eleve.nom, i.eleve.prenom, Number(i.totalDu), Number(i.totalPaye), Number(i.solde)]),
    }),
  },
  paiements: {
    roles: ["direction", "comptable"],
    fichier: "paiements",
    construire: async (p) => {
      const au = DATE.test(p.get("au") ?? "") ? p.get("au")! : aujourdhuiIso();
      const du = DATE.test(p.get("du") ?? "") ? p.get("du")! : au;
      return {
        entetes: ["Date", "Reçu", "Nom", "Prénom", "Classe", "Montant", "Mode", "Référence", "Statut", "Encaissé par"],
        lignes: (await journalCaisse(du, au)).map((x) => [x.date, x.numeroRecu, x.eleveNom, x.elevePrenom, x.classeNom ?? "", Number(x.montant), x.mode, x.reference ?? "", x.statut, x.encaissePar ?? ""]),
      };
    },
  },
};

function versCsv({ entetes, lignes }: Table) {
  const cellule = (v: string | number) => {
    const s = String(v ?? "");
    return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + [entetes, ...lignes].map((l) => l.map(cellule).join(";")).join("\r\n");
}

export async function GET(request: Request, ctx: RouteContext<"/api/exports/[type]">) {
  const { type } = await ctx.params;
  const session = await getSession();
  if (!session) return new Response("Non authentifié / Unauthenticated", { status: 401 });
  const def = EXPORTS[type];
  if (!def) return new Response("Export inconnu / Unknown export", { status: 404 });
  if (!def.roles.includes(session.role)) return new Response("Accès refusé / Access denied", { status: 403 });

  const contenu = versCsv(await def.construire(new URL(request.url).searchParams));
  return new Response(contenu, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${def.fichier}-${aujourdhuiIso()}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
