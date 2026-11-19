// Route : /[lang]/direction/personnel — Personnel de l'établissement et affectations des enseignants (CU-DIR-03).
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { getLang, getT } from "@/lib/i18n/server";
import { affectations as lireAffectations, classes as lireClasses, matieres as lireMatieres, personnel } from "@/lib/api/backend";
import { creerAffectation } from "@/features/personnel/actions";
import { ROLES_PERSONNEL } from "@/features/personnel/libelles";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LigneVide, Table, Td, Th } from "@/components/ui/data-table";
import { Field, Select } from "@/components/ui/form-field";
import { Formulaire } from "@/components/ui/formulaire";

export default async function PersonnelPage() {
  const [t, lang, membres, affectations, classes, matieres] = await Promise.all([getT(), getLang(), personnel(), lireAffectations(), lireClasses(), lireMatieres()]);
  const enseignants = membres.filter((m) => m.roles.includes("ENSEIGNANT"));
  return (
    <>
      <PageHeader
        titre={t("Personnel", "Staff")}
        sousTitre={t(`${membres.length} membres · ${enseignants.length} enseignants`, `${membres.length} members · ${enseignants.length} teachers`)}
        actions={
          <Link href={`/${lang}/direction/personnel/nouveau`} className="inline-flex items-center gap-2 rounded-lg bg-navy-700 px-4 py-2 text-sm font-semibold text-white">
            <UserPlus className="size-4" /> {t("Ajouter un membre", "Add a member")}
          </Link>
        }
      />
      <PageBody>
        <Card>
          <Table>
            <thead>
              <tr><Th>{t("Nom", "Name")}</Th><Th>{t("Téléphone", "Phone")}</Th><Th>{t("Rôles", "Roles")}</Th><Th>{t("Classes", "Classes")}</Th></tr>
            </thead>
            <tbody>
              {membres.length === 0 && <LigneVide colSpan={4} texte={t("Aucun membre.", "No member.")} />}
              {membres.map((m) => (
                <tr key={m.utilisateurId}>
                  <Td><Link href={`/${lang}/direction/personnel/${m.utilisateurId}`} className="font-semibold text-navy-700 hover:underline">{m.prenom} {m.nom}</Link></Td>
                  <Td className="text-muted">{m.telephone ?? m.email ?? "—"}</Td>
                  <Td><span className="flex flex-wrap gap-1">{m.roles.map((r) => <Badge key={r} ton="neutre">{t(...(ROLES_PERSONNEL[r] ?? [r, r]))}</Badge>)}</span></Td>
                  <Td className="text-muted">
                    {affectations.filter((a) => a.enseignantId === m.utilisateurId).map((a) => `${a.classeNom} (${a.matiereNom})`).join(", ") || "—"}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <Card className="max-w-2xl">
          <CardHeader titre={t("Affecter un enseignant", "Assign a teacher")} sousTitre={t("L'enseignant retrouve la classe dans l'application mobile (appel, notes).", "The teacher finds the class in the mobile app (roll call, marks).")} />
          <Formulaire action={creerAffectation} libelle={t("Affecter", "Assign")}>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label={t("Enseignant", "Teacher")}><Select name="enseignantId" vide={t("Choisir…", "Choose…")} options={enseignants.map((m) => ({ value: m.utilisateurId, label: `${m.prenom} ${m.nom}` }))} /></Field>
              <Field label={t("Classe", "Class")}><Select name="classeId" vide={t("Choisir…", "Choose…")} options={classes.map((c) => ({ value: c.id, label: c.nom }))} /></Field>
              <Field label={t("Matière", "Subject")}><Select name="matiereId" vide={t("Choisir…", "Choose…")} options={matieres.map((m) => ({ value: m.id, label: m.nom }))} /></Field>
            </div>
          </Formulaire>
        </Card>
      </PageBody>
    </>
  );
}
