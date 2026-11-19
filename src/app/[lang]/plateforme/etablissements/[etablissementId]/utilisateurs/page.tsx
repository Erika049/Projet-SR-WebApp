// Route : /[lang]/plateforme/etablissements/[etablissementId]/utilisateurs — Personnel de l'établissement (CU-SAD-02).
import { getT } from "@/lib/i18n/server";
import { personnel } from "@/lib/api/backend";
import { ajouterMembre } from "@/features/personnel/actions";
import { ROLES_PERSONNEL } from "@/features/personnel/libelles";
import { ChampsMembre } from "@/features/personnel/components/champs-membre";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LigneVide, Table, Td, Th } from "@/components/ui/data-table";
import { Formulaire } from "@/components/ui/formulaire";

export default async function EtablissementPersonnelPage({ params }: PageProps<"/[lang]/plateforme/etablissements/[etablissementId]/utilisateurs">) {
  const [{ etablissementId }, t] = await Promise.all([params, getT()]);
  const membres = await personnel(etablissementId);
  return (
    <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
      <Card>
        <Table>
          <thead><tr><Th>{t("Nom", "Name")}</Th><Th>{t("Téléphone", "Phone")}</Th><Th>{t("Rôles", "Roles")}</Th></tr></thead>
          <tbody>
            {membres.length === 0 && <LigneVide colSpan={3} texte={t("Aucun membre.", "No member.")} />}
            {membres.map((m) => (
              <tr key={m.utilisateurId}>
                <Td className="font-semibold">{m.prenom} {m.nom}</Td>
                <Td className="text-muted">{m.telephone ?? m.email ?? "—"}</Td>
                <Td><span className="flex flex-wrap gap-1">{m.roles.map((r) => <Badge key={r} ton="neutre">{t(...(ROLES_PERSONNEL[r] ?? [r, r]))}</Badge>)}</span></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
      <Card className="h-fit">
        <CardHeader titre={t("Ajouter un compte", "Add an account")} />
        <Formulaire action={ajouterMembre.bind(null, etablissementId)} libelle={t("Créer le compte", "Create account")}>
          <ChampsMembre />
        </Formulaire>
      </Card>
    </div>
  );
}
