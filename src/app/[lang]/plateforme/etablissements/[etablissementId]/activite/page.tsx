// Route : /[lang]/plateforme/etablissements/[etablissementId]/activite — Activité et tickets de l'établissement (CU-SAD-04).
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLang, getT } from "@/lib/i18n/server";
import { jourMois, quand } from "@/lib/format";
import { STATUT_TICKET, lib, ton } from "@/lib/labels";
import { getEtablissement } from "@/features/plateforme/queries";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function EtablissementActivitePage({ params }: PageProps<"/[lang]/plateforme/etablissements/[etablissementId]/activite">) {
  const [{ etablissementId }, t, lang] = await Promise.all([params, getT(), getLang()]);
  const e = await getEtablissement(etablissementId);
  if (!e) notFound();
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader titre={t("Journal d'activité", "Activity log")} />
        {e.activite.length === 0 && <p className="text-sm text-muted">{t("Aucune activité.", "No activity.")}</p>}
        <ul className="divide-y divide-line">
          {e.activite.map((a) => (
            <li key={a.id} className="flex justify-between gap-3 py-2.5 text-sm">
              <span><strong>{a.action}</strong> <span className="text-muted">· {a.acteur}{a.cible ? ` · ${a.cible}` : ""}</span></span>
              <span className="shrink-0 text-xs text-muted">{quand(a.date, lang)}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <CardHeader titre={t("Tickets", "Tickets")} />
        {e.tickets.length === 0 && <p className="text-sm text-muted">{t("Aucun ticket.", "No tickets.")}</p>}
        <ul className="divide-y divide-line">
          {e.tickets.map((tk) => (
            <li key={tk.id}>
              <Link href={`/${lang}/plateforme/support/${tk.id}`} className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-navy-700">
                <span>#{tk.numero} · {tk.objet} <span className="text-xs text-muted">· {jourMois(tk.creeLe, lang)}</span></span>
                <Badge ton={ton(STATUT_TICKET, tk.statut)}>{lib(STATUT_TICKET, tk.statut, t)}</Badge>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
