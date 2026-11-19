// Route : /[lang]/plateforme/support — Tickets de support (CU-SAD-05). Le premier ticket est affiché par défaut.
import { getT } from "@/lib/i18n/server";
import { premier } from "@/lib/utils";
import { listerTickets } from "@/features/plateforme/queries";
import { TicketsList } from "@/features/plateforme/components/tickets-list";
import { TicketView } from "@/features/plateforme/components/ticket-view";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default async function SupportPlateformePage({ searchParams }: PageProps<"/[lang]/plateforme/support">) {
  const [sp, t] = await Promise.all([searchParams, getT()]);
  const resolus = premier(sp.vue) === "resolus";
  const tickets = await listerTickets(resolus ? "resolu" : undefined);
  const urgents = tickets.filter((x) => x.priorite === "urgent").length;
  return (
    <>
      <PageHeader titre="Support" sousTitre={resolus ? t(`${tickets.length} tickets résolus`, `${tickets.length} resolved tickets`) : t(`${tickets.length} tickets ouverts · ${urgents} urgents`, `${tickets.length} open tickets · ${urgents} urgent`)} />
      <PageBody>
        <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
          <TicketsList tickets={tickets} actif={tickets[0]?.id} resolus={resolus} />
          {tickets[0] ? <TicketView ticket={tickets[0]} /> : <EmptyState titre={t("Aucun ticket", "No tickets")} />}
        </div>
      </PageBody>
    </>
  );
}
