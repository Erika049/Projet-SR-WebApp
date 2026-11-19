"use client";
// Tableau d'avancement des bulletins par classe, avec sélection multiple et actions groupées (CU-DIR-05).
import Link from "next/link";
import { useActionState } from "react";
import { actionGroupee, publierClasse, relancerEnseignants, validerClasse } from "@/features/notes-bulletins/actions";
import { ETAT_INITIAL } from "@/lib/actions";
import { useLang, useT } from "@/lib/i18n/client";
import { STATUT_BULLETIN, lib, ton } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Table, Td, Th } from "@/components/ui/data-table";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import type { StatutBulletin } from "@/types/domain";

type Ligne = { classe: { id: string; libelle: string }; progression: number; statut: StatutBulletin };

export function BulletinsTable({ lignes, sequence, actions }: { lignes: Ligne[]; sequence: number; actions: boolean }) {
  const t = useT();
  const lang = useLang();
  const [etat, envoyer] = useActionState(actionGroupee.bind(null, sequence), ETAT_INITIAL);

  return (
    <form action={envoyer} className="space-y-4">
      <FormMessage etat={etat} />
      <Table>
        <thead>
          <tr>
            {actions && <Th className="w-8" />}
            <Th>{t("Classe", "Class")}</Th>
            <Th>{t("Notes saisies", "Marks entered")}</Th>
            <Th>{t("Statut", "Status")}</Th>
            <Th className="text-right">{t("Action", "Action")}</Th>
          </tr>
        </thead>
        <tbody>
          {lignes.map((l) => (
            <tr key={l.classe.id}>
              {actions && (
                <Td>
                  <input type="checkbox" name="classeId" value={l.classe.id} disabled={l.statut === "incomplet" || l.statut === "publie"} className="size-4 accent-navy-700" aria-label={l.classe.libelle} />
                </Td>
              )}
              <Td className="font-semibold">{l.classe.libelle}</Td>
              <Td>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${l.progression === 100 ? "bg-brand-600" : "bg-amber-500"}`} style={{ width: `${l.progression}%` }} />
                  </div>
                  <span className="text-xs font-semibold">{l.progression} %</span>
                </div>
              </Td>
              <Td><Badge ton={ton(STATUT_BULLETIN, l.statut)}>{lib(STATUT_BULLETIN, l.statut, t)}</Badge></Td>
              <Td>
                <div className="flex justify-end gap-1.5">
                  {l.progression === 100 && (
                    <Link href={`/${lang}/direction/notes-bulletins/${l.classe.id}?sequence=${sequence}`} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-navy-700 hover:bg-navy-50">
                      {l.statut === "publie" || l.statut === "valide" ? t("Voir", "View") : t("Aperçu", "Preview")}
                    </Link>
                  )}
                  {actions && l.statut === "a_valider" && (
                    <button formAction={validerClasse.bind(null, l.classe.id, sequence)} className="rounded-lg bg-navy-700 px-3 py-1.5 text-xs font-semibold text-white">
                      {t("Valider", "Approve")}
                    </button>
                  )}
                  {actions && l.statut === "valide" && (
                    <button formAction={publierClasse.bind(null, l.classe.id, sequence)} className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white">
                      {t("Publier", "Publish")}
                    </button>
                  )}
                  {actions && l.statut === "incomplet" && (
                    <button formAction={relancerEnseignants.bind(null, l.classe.id)} className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50">
                      {t("Relancer", "Remind")}
                    </button>
                  )}
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      {actions && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <div className="flex flex-wrap gap-2">
            <SubmitButton name="action" value="generer" variante="secondaire">{t("Générer les bulletins", "Generate report cards")}</SubmitButton>
            <SubmitButton name="action" value="cloturer" variante="secondaire" confirmation={t("Clôturer la saisie ? Les enseignants ne pourront plus modifier les notes.", "Close entry? Teachers will no longer be able to change marks.")}>
              {t("Clôturer la saisie", "Close mark entry")}
            </SubmitButton>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-muted">{t("À la publication, les parents reçoivent une notification.", "On publication, parents receive a notification.")}</span>
            <SubmitButton name="action" value="valider" variante="secondaire">{t("Valider la sélection", "Approve selection")}</SubmitButton>
            <SubmitButton name="action" value="publier" variante="succes">{t("Valider et publier la sélection", "Approve and publish selection")}</SubmitButton>
          </div>
        </div>
      )}
    </form>
  );
}
