// Annonces et convocations : publication (direction, surveillant général) ou lecture seule (secrétariat).
import { Eye, Send, Trash2 } from "lucide-react";
import { getLang, getT } from "@/lib/i18n/server";
import { jourMois, quand } from "@/lib/format";
import { CIBLE_ANNONCE, STATUT_ANNONCE, lib, ton } from "@/lib/labels";
import { listerAnnonces } from "@/features/annonces/queries";
import { listerClasses } from "@/features/parametrage/queries";
import { publierAnnonce, supprimerAnnonce } from "@/features/annonces/actions";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, Note } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, Td, Th } from "@/components/ui/data-table";
import { ActionButton } from "@/components/ui/action-button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { AnnonceForm } from "./annonce-form";

type Mode = "direction" | "surveillant" | "lecture";

export async function AnnoncesPage({ mode }: { mode: Mode }) {
  const [t, lang] = await Promise.all([getT(), getLang()]);
  const [annonces, classes] = await Promise.all([listerAnnonces(mode === "surveillant" ? "surveillant" : undefined), listerClasses()]);
  const titre = mode === "direction" ? t("Annonces et convocations", "Announcements and summons") : mode === "surveillant" ? t("Annonces de vie scolaire", "School life announcements") : t("Annonces", "Announcements");
  const auteur = (r: string) => (r === "direction" ? t("Direction", "Management") : t("Surveillant général", "Head of discipline"));
  const destinataires = (a: (typeof annonces)[number]) => (a.cible === "classe" ? `${t("Parents", "Parents")} · ${a.classes.join(", ")}` : lib(CIBLE_ANNONCE, a.cible, t));

  const sousTitre =
    mode === "direction"
      ? t("Les annonces arrivent dans l'application mobile des parents et des enseignants. Seules la direction et le surveillant général en publient.", "Announcements reach the parents' and teachers' mobile app. Only management and the head of discipline publish them.")
      : mode === "surveillant"
        ? t("La direction et le surveillant général sont les seuls à publier des annonces.", "Only management and the head of discipline publish announcements.")
        : t("Le secrétariat consulte les annonces. Seules la direction et le surveillant général les publient.", "The secretariat reads announcements. Only management and the head of discipline publish them.");

  const historique = (
    <Card>
      <CardHeader titre={mode === "lecture" ? t("Annonces de l'établissement", "School announcements") : mode === "surveillant" ? t("Mes annonces", "My announcements") : t("Historique", "History")} />
      {annonces.length === 0 ? (
        <EmptyState titre={t("Aucune annonce", "No announcements")} />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>{t("Annonce", "Announcement")}</Th>
              {mode !== "surveillant" && <Th>{t("Publiée par", "Published by")}</Th>}
              <Th>{t("Destinataires", "Recipients")}</Th>
              <Th>{t("Date", "Date")}</Th>
              <Th>{t("Statut", "Status")}</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {annonces
              .filter((a) => mode !== "lecture" || a.statut === "publiee")
              .map((a) => (
                <tr key={a.id}>
                  <Td className="font-semibold">
                    {a.titre}
                    {a.type === "convocation" && <Badge ton="navy" className="ml-2">{t("Convocation", "Summons")}</Badge>}
                  </Td>
                  {mode !== "surveillant" && <Td>{auteur(a.auteurRole)}</Td>}
                  <Td className="text-muted">{destinataires(a)}</Td>
                  <Td className="whitespace-nowrap">{a.statut === "publiee" ? quand(a.date, lang) : jourMois(a.date, lang)}</Td>
                  <Td>
                    <Badge ton={ton(STATUT_ANNONCE, a.statut)}>{lib(STATUT_ANNONCE, a.statut, t)}</Badge>
                  </Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      <Dialog declencheur={<><Eye className="size-3.5" /> {t("Lire", "Read")}</>} titre={a.titre}>
                        <p className="whitespace-pre-line text-sm leading-relaxed">{a.message}</p>
                        <p className="mt-4 text-xs text-muted">
                          {auteur(a.auteurRole)} · {destinataires(a)} · {a.canaux.map((c) => c.toUpperCase()).join(", ")}
                        </p>
                      </Dialog>
                      {mode !== "lecture" && a.statut !== "publiee" && (
                        <>
                          <ActionButton action={publierAnnonce.bind(null, a.id)} variante="succes">
                            <Send className="size-3.5" />
                          </ActionButton>
                          <ActionButton action={supprimerAnnonce.bind(null, a.id)} variante="danger" confirmation={t("Supprimer cette annonce ?", "Delete this announcement?")}>
                            <Trash2 className="size-3.5" />
                          </ActionButton>
                        </>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
          </tbody>
        </Table>
      )}
    </Card>
  );

  return (
    <>
      <PageHeader titre={titre} sousTitre={sousTitre} />
      <PageBody>
        {mode === "lecture" ? (
          <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
            {historique}
            <Card className="h-fit space-y-4">
              <CardHeader titre={t("Qui peut publier ?", "Who can publish?")} />
              {[
                [t("Direction", "Management"), t("Toutes les annonces de l'établissement", "All school announcements"), t("Publie", "Publishes"), "succes"],
                [t("Surveillant général", "Head of discipline"), t("Absences, retards, horaires, vie scolaire", "Absences, lateness, schedules, school life"), t("Publie", "Publishes"), "succes"],
                [t("Secrétariat", "Secretariat"), t("Consultation uniquement", "Read only"), t("Lecture seule", "Read only"), "neutre"],
              ].map(([qui, quoi, droit, tn]) => (
                <div key={qui} className="flex items-start justify-between gap-3 text-sm">
                  <div>
                    <p className="font-semibold">{qui}</p>
                    <p className="text-muted">{quoi}</p>
                  </div>
                  <Badge ton={tn as "succes" | "neutre"}>{droit}</Badge>
                </div>
              ))}
              <Note titre={t("Besoin d'informer les parents ?", "Need to inform parents?")}>
                {t("Transmettez votre message à la direction ou au surveillant général.", "Send your message to management or the head of discipline.")}
              </Note>
            </Card>
          </div>
        ) : (
          <>
            <Card>
              <CardHeader titre={t("Nouvelle annonce", "New announcement")} />
              <AnnonceForm classes={classes.map((c) => ({ id: c.id, libelle: c.libelle }))} convocations={mode === "direction"} />
            </Card>
            {mode === "surveillant" && (
              <Note titre={t("Vos annonces", "Your announcements")}>
                {t("Vous publiez les annonces de vie scolaire (absences, retards, horaires). Elles partent immédiatement vers les parents et les enseignants.", "You publish school life announcements (absences, lateness, schedules). They go straight to parents and teachers.")}
              </Note>
            )}
            {historique}
          </>
        )}
      </PageBody>
    </>
  );
}
