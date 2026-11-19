// Route : /[lang]/direction/parametrage — Année scolaire et périodes (séquences, trimestres), ouverture de la saisie des notes.
import { getLang, getT } from "@/lib/i18n/server";
import { dateCourte } from "@/lib/format";
import { annees as lireAnnees, periodes as lirePeriodes } from "@/lib/api/backend";
import { basculerSaisie, creerAnnee, creerPeriode } from "@/features/parametrage/actions";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/components/ui/action-button";
import { LigneVide, Table, Td, Th } from "@/components/ui/data-table";
import { Field, Input, Select } from "@/components/ui/form-field";
import { Formulaire } from "@/components/ui/formulaire";

export default async function AnneePage() {
  const [t, lang, annees] = await Promise.all([getT(), getLang(), lireAnnees()]);
  const courante = annees.find((a) => a.courante) ?? null;
  const periodes = courante ? await lirePeriodes(courante.id) : [];
  const libelle = (type: string, n: number) =>
    type === "SEQUENCE" ? t(`Séquence ${n}`, `Sequence ${n}`) : type === "TRIMESTRE" ? t(`Trimestre ${n}`, `Term ${n}`) : t("Année", "Year");

  return (
    <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
      <Card>
        <CardHeader
          titre={courante ? t(`Année ${courante.libelle}`, `Year ${courante.libelle}`) : t("Aucune année courante", "No current year")}
          sousTitre={courante ? `${dateCourte(courante.dateDebut, lang)} → ${dateCourte(courante.dateFin, lang)}` : t("Créez l'année scolaire pour commencer.", "Create the school year to begin.")}
        />
        <Table>
          <thead>
            <tr>
              <Th>{t("Période", "Term")}</Th>
              <Th>{t("Dates", "Dates")}</Th>
              <Th>{t("Saisie des notes", "Mark entry")}</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {periodes.length === 0 && <LigneVide colSpan={4} texte={t("Aucune période.", "No term.")} />}
            {periodes.map((p) => (
              <tr key={p.id}>
                <Td className="font-semibold">{libelle(p.type, p.numero)}</Td>
                <Td className="text-muted">{dateCourte(p.dateDebut, lang)} → {dateCourte(p.dateFin, lang)}</Td>
                <Td><Badge ton={p.saisieOuverte ? "succes" : "neutre"}>{p.saisieOuverte ? t("Ouverte", "Open") : t("Fermée", "Closed")}</Badge></Td>
                <Td>
                  {courante && (
                    <ActionButton action={basculerSaisie.bind(null, courante.id, p.id, !p.saisieOuverte)} variante={p.saisieOuverte ? "danger" : "succes"}>
                      {p.saisieOuverte ? t("Fermer la saisie", "Close entry") : t("Ouvrir la saisie", "Open entry")}
                    </ActionButton>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
      <div className="space-y-6">
        {courante && (
          <Card>
            <CardHeader titre={t("Nouvelle période", "New term")} />
            <Formulaire action={creerPeriode.bind(null, courante.id)} libelle={t("Créer la période", "Create term")}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label={t("Type", "Type")}>
                  <Select name="type" options={[{ value: "SEQUENCE", label: t("Séquence", "Sequence") }, { value: "TRIMESTRE", label: t("Trimestre", "Term") }]} />
                </Field>
                <Field label={t("Numéro", "Number")}><Input type="number" name="numero" min={1} max={6} required /></Field>
                <Field label={t("Début", "Start")}><Input type="date" name="dateDebut" required /></Field>
                <Field label={t("Fin", "End")}><Input type="date" name="dateFin" required /></Field>
              </div>
            </Formulaire>
          </Card>
        )}
        <Card>
          <CardHeader titre={t("Nouvelle année scolaire", "New school year")} />
          <Formulaire action={creerAnnee} libelle={t("Créer l'année", "Create year")}>
            <Field label={t("Libellé", "Label")}><Input name="libelle" placeholder="2027-2028" required /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t("Début", "Start")}><Input type="date" name="dateDebut" required /></Field>
              <Field label={t("Fin", "End")}><Input type="date" name="dateFin" required /></Field>
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="courante" /> {t("Année courante", "Current year")}</label>
          </Formulaire>
        </Card>
      </div>
    </div>
  );
}
