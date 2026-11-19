"use client";
// Le surveillant général a vérifié la fiche d'appel soumise par l'enseignant : il prévient les parents des absents.
import { useActionState } from "react";
import { BellRing } from "lucide-react";
import { notifierParentsAppel } from "@/features/presences/actions";
import { ETAT_INITIAL } from "@/lib/actions";
import { useT } from "@/lib/i18n/client";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";

export function NotifierParentsForm({ classeId, appelId, aNotifier }: { classeId: string; appelId: string; aNotifier: number }) {
  const t = useT();
  const [etat, action] = useActionState(notifierParentsAppel.bind(null, classeId, appelId), ETAT_INITIAL);
  return (
    <form action={action} className="space-y-3">
      <FormMessage etat={etat} />
      {!etat.ok && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            {t(
              `Après vérification, ${aNotifier} famille(s) recevront une notification dans l'application mobile.`,
              `After checking, ${aNotifier} family(ies) will receive a notification in the mobile app.`,
            )}
          </p>
          <SubmitButton variante="primaire" confirmation={t("Prévenir les parents des élèves absents ?", "Notify the parents of absent students?")}>
            <BellRing className="size-4" /> {t("Notifier les parents des absents", "Notify parents of absentees")}
          </SubmitButton>
        </div>
      )}
    </form>
  );
}
