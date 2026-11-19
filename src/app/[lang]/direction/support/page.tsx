// Route : /[lang]/direction/support — Demandes d'assistance au support SchoolConnect.
import { Mail, Phone, Clock } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/dal";
import { getLang, getT } from "@/lib/i18n/server";
import { jourMois } from "@/lib/format";
import { STATUT_TICKET, lib, ton } from "@/lib/labels";
import { ticketsEtablissement } from "@/features/support/queries";
import { TicketForm } from "@/features/support/components/ticket-form";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SupportPage() {
  const [t, lang, session] = await Promise.all([getT(), getLang(), getCurrentUser()]);
  const tickets = await ticketsEtablissement(session.etablissementId!);
  return (
    <>
      <PageHeader titre="Support" sousTitre={t("Signalez un problème ou posez une question à l'équipe SchoolConnect.", "Report an issue or ask the SchoolConnect team a question.")} />
      <PageBody>
        <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
          <Card>
            <CardHeader titre={t("Nouvelle demande", "New request")} />
            <TicketForm />
          </Card>
          <div className="space-y-6">
            <Card>
              <CardHeader titre={t("Mes demandes", "My requests")} />
              <ul className="divide-y divide-line">
                {tickets.map((x) => (
                  <li key={x.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <div>
                      <p className="font-semibold">{x.objet}</p>
                      <p className="text-xs text-muted">#{x.numero} · {x.type} · {jourMois(x.creeLe, lang)}</p>
                    </div>
                    <Badge ton={ton(STATUT_TICKET, x.statut)}>{lib(STATUT_TICKET, x.statut, t)}</Badge>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <CardHeader titre={t("Joindre le support", "Contact support")} />
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Mail className="size-4 text-muted" /> support@schoolconnect.cm</li>
                <li className="flex items-center gap-2"><Phone className="size-4 text-muted" /> +237 6XX XXX 900</li>
                <li className="flex items-center gap-2"><Clock className="size-4 text-muted" /> {t("Lun–Ven · 8 h–17 h", "Mon–Fri · 8am–5pm")}</li>
              </ul>
              <p className="mt-3 text-xs text-muted">{t("Réponse sous 24 h ouvrées, 4 h pour les urgences.", "Reply within 24 business hours, 4 h for emergencies.")}</p>
            </Card>
          </div>
        </div>
      </PageBody>
    </>
  );
}
