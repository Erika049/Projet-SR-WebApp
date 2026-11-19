// Route : /[lang]/direction/parametrage — Année scolaire, trimestres et séquences (CU-DIR-02).
import { getLang, getT } from "@/lib/i18n/server";
import { dateCourte, jourMois } from "@/lib/format";
import { STATUT_PERIODE, lib, ton } from "@/lib/labels";
import { parametrage } from "@/features/parametrage/queries";
import { cloturerAnnee, modifierSequence, modifierTrimestre } from "@/features/parametrage/actions";
import { AnneeForm, PeriodeForm } from "@/features/parametrage/components/forms";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, Td, Th } from "@/components/ui/data-table";
import { Dialog } from "@/components/ui/dialog";
import { ActionButton } from "@/components/ui/action-button";
import { Button } from "@/components/ui/button";

export default async function ParametrageAnneePage() {
  const [t, lang, p] = await Promise.all([getT(), getLang(), parametrage()]);
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
        <Card>
          <CardHeader titre={t("Année scolaire", "School year")} action={<Badge ton={p.annee.statut === "en_cours" ? "succes" : "navy"}>{p.annee.statut === "en_cours" ? t("En cours", "In progress") : p.annee.statut === "cloturee" ? t("Clôturée", "Closed") : t("En préparation", "Preparing")}</Badge>} />
          <AnneeForm annee={p.annee} />
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader titre={t("Préparer l'année suivante", "Prepare next year")} sousTitre={t(`Dupliquez la structure de ${p.annee.libelle} (classes, matières, coefficients, tarifs) pour gagner du temps.`, `Duplicate the ${p.annee.libelle} structure (classes, subjects, coefficients, fees) to save time.`)} />
            <Button variante="secondaire" disabled title={t("Disponible en fin d'année", "Available at year end")}>{t("Préparer 2027-2028", "Prepare 2027-2028")}</Button>
          </Card>
          <Card>
            <CardHeader titre={t("Clôturer l'année", "Close the year")} sousTitre={t("Fige les notes, les bulletins et les présences. Action réservée à la direction.", "Freezes marks, report cards and attendance. Management only.")} />
            <ActionButton action={cloturerAnnee} variante="danger" taille="md" confirmation={t("Clôturer définitivement l'année ? Cette action est irréversible.", "Permanently close the year? This cannot be undone.")}>
              {t("Clôturer l'année", "Close the year")}
            </ActionButton>
          </Card>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader titre={t("Trimestres", "Terms")} />
          <Table>
            <thead>
              <tr>
                <Th>{t("Période", "Term")}</Th>
                <Th>{t("Séquences", "Sequences")}</Th>
                <Th>{t("Début", "Start")}</Th>
                <Th>{t("Fin", "End")}</Th>
                <Th>{t("Statut", "Status")}</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {p.trimestres.map((tr) => (
                <tr key={tr.id}>
                  <Td className="font-semibold">{t("Trimestre", "Term")} {tr.numero}</Td>
                  <Td>{tr.numero * 2 - 1} · {tr.numero * 2}</Td>
                  <Td>{dateCourte(tr.debut, lang)}</Td>
                  <Td>{dateCourte(tr.fin, lang)}</Td>
                  <Td><Badge ton={ton(STATUT_PERIODE, tr.statut)}>{lib(STATUT_PERIODE, tr.statut, t)}</Badge></Td>
                  <Td className="text-right">
                    <Dialog declencheur={t("Modifier", "Edit")} titre={`${t("Trimestre", "Term")} ${tr.numero}`}>
                      <PeriodeForm action={modifierTrimestre.bind(null, tr.id)} debut={tr.debut} fin={tr.fin} statut={tr.statut} />
                    </Dialog>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <Card>
          <CardHeader titre={t("Séquences et saisie des notes", "Sequences and mark entry")} />
          <ul className="divide-y divide-line">
            {p.sequences.map((s) => (
              <li key={s.numero} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div>
                  <p className="font-semibold">{t("Séquence", "Sequence")} {s.numero}</p>
                  <p className="text-xs text-muted">{jourMois(s.debut, lang)} – {jourMois(s.fin, lang)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge ton={ton(STATUT_PERIODE, s.statut)}>
                    {s.saisieJusquau ? `${t("Saisie ouverte jusqu'au", "Entry open until")} ${jourMois(s.saisieJusquau, lang)}` : lib(STATUT_PERIODE, s.statut, t)}
                  </Badge>
                  <Dialog declencheur={t("Modifier", "Edit")} titre={`${t("Séquence", "Sequence")} ${s.numero}`}>
                    <PeriodeForm action={modifierSequence.bind(null, s.numero)} debut={s.debut} fin={s.fin} statut={s.statut} sequence saisieJusquau={s.saisieJusquau} />
                  </Dialog>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
