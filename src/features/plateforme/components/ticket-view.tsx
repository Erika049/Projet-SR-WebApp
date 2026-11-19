// Conversation d'un ticket de support + réponse (CU-SAD-05).
import { getLang, getT } from "@/lib/i18n/server";
import { heure, ilYa } from "@/lib/format";
import { PRIORITE, lib, ton } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { ouvrirAccesSupport, repondreTicket, resoudreTicket } from "@/features/plateforme/actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/components/ui/action-button";
import { ReponseForm } from "./reponse-form";
import type { Etablissement, Ticket } from "@/types/domain";

export async function TicketView({ ticket }: { ticket: Ticket & { etablissement: Etablissement } }) {
  const [t, lang] = await Promise.all([getT(), getLang()]);
  return (
    <Card className="flex flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
        <div>
          <h2 className="text-lg font-bold text-navy-800">{ticket.objet}</h2>
          <p className="text-sm text-muted">{ticket.etablissement.nom} · Ticket #{ticket.numero} · {ilYa(ticket.creeLe, lang)}</p>
        </div>
        <Badge ton={ton(PRIORITE, ticket.priorite)}>{lib(PRIORITE, ticket.priorite, t)}</Badge>
      </div>
      <ul className="flex-1 space-y-4 py-4">
        {ticket.messages.map((m, i) => (
          <li key={i} className={cn("max-w-[85%] rounded-xl p-3 text-sm", m.support ? "ml-auto bg-navy-700 text-white" : "bg-slate-100")}>
            <p className={cn("mb-1 flex justify-between gap-4 text-xs font-semibold", m.support ? "text-white/80" : "text-muted")}>
              <span>{m.auteur}</span>
              <span>{heure(m.date)}</span>
            </p>
            {m.texte}
          </li>
        ))}
      </ul>
      {ticket.statut !== "resolu" ? (
        <div className="space-y-3 border-t border-line pt-4">
          <ReponseForm action={repondreTicket.bind(null, ticket.id)} />
          <div className="flex flex-wrap gap-2">
            <ActionButton action={resoudreTicket.bind(null, ticket.id)} variante="succes" taille="md">{t("Marquer comme résolu", "Mark as resolved")}</ActionButton>
            <ActionButton action={ouvrirAccesSupport.bind(null, ticket.etablissementId)} taille="md">{t("Ouvrir l'école (lecture seule)", "Open the school (read only)")}</ActionButton>
          </div>
        </div>
      ) : (
        <p className="border-t border-line pt-4 text-center text-sm font-semibold text-brand-700">{t("Ticket résolu", "Ticket resolved")}</p>
      )}
    </Card>
  );
}
