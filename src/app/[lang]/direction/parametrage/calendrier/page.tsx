// Route : /[lang]/direction/parametrage/calendrier — Calendrier scolaire : congés, compositions, événements (CU-DIR-02).
import { Trash2 } from "lucide-react";
import { getLang, getT } from "@/lib/i18n/server";
import { dateCourte } from "@/lib/format";
import { parametrage } from "@/features/parametrage/queries";
import { supprimerEvenement } from "@/features/parametrage/actions";
import { EvenementForm } from "@/features/parametrage/components/forms";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/components/ui/action-button";

export default async function ParametrageCalendrierPage() {
  const [t, lang, p] = await Promise.all([getT(), getLang(), parametrage()]);
  const types = { conge: [t("Congé", "Holiday"), "info"], examen: [t("Compositions", "Exams"), "alerte"], evenement: [t("Événement", "Event"), "navy"] } as const;
  return (
    <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
      <Card>
        <CardHeader titre={t("Calendrier", "Calendar")} sousTitre={`${t("Année", "Year")} ${p.annee.libelle}`} />
        <ul className="divide-y divide-line">
          {p.calendrier.map((ev) => (
            <li key={ev.id} className="flex items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-3">
                <div className="w-28 shrink-0 text-sm font-semibold text-navy-800">
                  {dateCourte(ev.debut, lang)}
                  {ev.fin !== ev.debut && <span className="block text-xs font-normal text-muted">→ {dateCourte(ev.fin, lang)}</span>}
                </div>
                <span className="text-sm">{ev.libelle}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge ton={types[ev.type][1]}>{types[ev.type][0]}</Badge>
                <ActionButton action={supprimerEvenement.bind(null, ev.id)} variante="fantome" confirmation={t("Supprimer cet événement ?", "Delete this event?")}>
                  <Trash2 className="size-4" />
                </ActionButton>
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <Card className="h-fit">
        <CardHeader titre={t("Ajouter une date", "Add a date")} />
        <EvenementForm />
      </Card>
    </div>
  );
}
