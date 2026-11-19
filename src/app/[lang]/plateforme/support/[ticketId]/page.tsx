// Route : /[lang]/plateforme/support/[ticketId] — Ticket de support (CU-SAD-05).
import { notFound } from "next/navigation";
import { getT } from "@/lib/i18n/server";
import { premier } from "@/lib/utils";
import { getTicket, listerTickets } from "@/features/plateforme/queries";
import { TicketsList } from "@/features/plateforme/components/tickets-list";
import { TicketView } from "@/features/plateforme/components/ticket-view";
import { PageBody, PageHeader } from "@/components/layout/page-header";

export default async function TicketPage({ params, searchParams }: PageProps<"/[lang]/plateforme/support/[ticketId]">) {
  const [{ ticketId }, sp, t] = await Promise.all([params, searchParams, getT()]);
  const resolus = premier(sp.vue) === "resolus";
  const [ticket, tickets] = await Promise.all([getTicket(ticketId), listerTickets(resolus ? "resolu" : undefined)]);
  if (!ticket) notFound();
  return (
    <>
      <PageHeader titre="Support" sousTitre={t(`Ticket #${ticket.numero}`, `Ticket #${ticket.numero}`)} />
      <PageBody>
        <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
          <TicketsList tickets={tickets} actif={ticket.id} resolus={resolus} />
          <TicketView ticket={ticket} />
        </div>
      </PageBody>
    </>
  );
}
