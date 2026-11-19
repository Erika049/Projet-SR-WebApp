// Annonces aux parents (direction, surveillant général, secrétariat) : publication et historique.
// Chaque annonce est envoyée en notification dans l'application mobile des parents ciblés.
import { getLang, getT } from "@/lib/i18n/server";
import { quand } from "@/lib/format";
import { annonces as lireAnnonces, classes as lireClasses } from "@/lib/api/backend";
import { publierAnnonce } from "@/features/annonces/actions";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select, Textarea } from "@/components/ui/form-field";
import { Formulaire } from "@/components/ui/formulaire";

export async function AnnoncesPage() {
  const [t, lang, liste, classes] = await Promise.all([getT(), getLang(), lireAnnonces(), lireClasses()]);
  return (
    <>
      <PageHeader titre={t("Annonces", "Announcements")} sousTitre={t("Envoyées aux parents dans l'application mobile SchoolConnect.", "Sent to parents in the SchoolConnect mobile app.")} />
      <PageBody>
        <div className="grid gap-6 xl:grid-cols-[2fr_3fr]">
          <Card className="h-fit">
            <CardHeader titre={t("Nouvelle annonce", "New announcement")} />
            <Formulaire action={publierAnnonce} libelle={t("Envoyer aux parents", "Send to parents")} confirmation={t("Envoyer cette annonce aux parents ?", "Send this announcement to parents?")}>
              <Field label={t("Destinataires", "Recipients")}>
                <Select name="classeId" vide={t("Tous les parents de l'établissement", "All parents of the school")} options={classes.map((c) => ({ value: c.id, label: t(`Parents de la ${c.nom}`, `Parents of ${c.nom}`) }))} />
              </Field>
              <Field label={t("Titre", "Title")}>
                <Input name="titre" maxLength={150} required />
              </Field>
              <Field label={t("Message", "Message")}>
                <Textarea name="message" maxLength={2000} required />
              </Field>
            </Formulaire>
          </Card>
          <Card>
            <CardHeader titre={t(`Annonces envoyées · ${liste.length}`, `Sent announcements · ${liste.length}`)} />
            {liste.length === 0 ? (
              <EmptyState titre={t("Aucune annonce envoyée", "No announcement sent")} />
            ) : (
              <ul className="divide-y divide-line">
                {liste.map((a) => (
                  <li key={a.id} className="space-y-1 py-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-ink">{a.titre}</p>
                      <Badge ton="neutre">{a.classeNom ?? t("Tout l'établissement", "Whole school")}</Badge>
                    </div>
                    <p className="whitespace-pre-line text-muted">{a.message}</p>
                    <p className="text-xs text-muted">
                      {a.auteur ?? "—"} · {quand(a.creeLe, lang)} · {t(`${a.destinataires} parent(s) notifié(s)`, `${a.destinataires} parent(s) notified`)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </PageBody>
    </>
  );
}
