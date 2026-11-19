import Link from "next/link";
import { getLang, getT } from "@/lib/i18n/server";
import { ilYa } from "@/lib/format";
import { PRIORITE, lib, ton } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Etablissement, Ticket } from "@/types/domain";

/** Liste des tickets (colonne de gauche de la maquette « Support »). */
export async function TicketsList({ tickets, actif, resolus }: { tickets: (Ticket & { etablissement: Etablissement })[]; actif?: string; resolus: boolean }) {
  const [t, lang] = await Promise.all([getT(), getLang()]);
  const base = `/${lang}/plateforme/support`;
  return (
    <Card className="h-fit p-2!">
      <div className="flex gap-1 p-2">
        <Link href={base} className={cn("rounded-lg px-3 py-1.5 text-sm font-semibold", !resolus ? "bg-navy-50 text-navy-800" : "text-muted")}>{t("Ouverts", "Open")}</Link>
        <Link href={`${base}?vue=resolus`} className={cn("rounded-lg px-3 py-1.5 text-sm font-semibold", resolus ? "bg-navy-50 text-navy-800" : "text-muted")}>{t("Résolus", "Resolved")}</Link>
      </div>
      <ul>
        {tickets.length === 0 && <li className="p-4 text-sm text-muted">{t("Aucun ticket.", "No tickets.")}</li>}
        {tickets.map((tk) => (
          <li key={tk.id}>
            <Link href={`${base}/${tk.id}${resolus ? "?vue=resolus" : ""}`} className={cn("block rounded-xl p-3 hover:bg-slate-50", actif === tk.id && "bg-navy-50")}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold">{tk.objet}</p>
                <Badge ton={ton(PRIORITE, tk.priorite)}>{lib(PRIORITE, tk.priorite, t)}</Badge>
              </div>
              <p className="text-xs text-muted">{tk.etablissement.nom} · {ilYa(tk.creeLe, lang)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
