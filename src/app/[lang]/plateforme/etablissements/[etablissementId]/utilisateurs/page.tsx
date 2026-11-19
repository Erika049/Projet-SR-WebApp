// Route : /[lang]/plateforme/etablissements/[etablissementId]/utilisateurs — Comptes web de l'établissement (CU-SAD-02).
import { notFound } from "next/navigation";
import { getLang, getT } from "@/lib/i18n/server";
import { derniereConnexion } from "@/lib/format";
import { STATUT_COMPTE, lib, ton } from "@/lib/labels";
import { LIBELLE_ROLE } from "@/lib/auth/roles";
import { getEtablissement } from "@/features/plateforme/queries";
import { actionCompte } from "@/features/plateforme/actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LigneVide, Table, Td, Th } from "@/components/ui/data-table";
import { Personne } from "@/components/ui/avatar";
import { ActionButton } from "@/components/ui/action-button";

export default async function EtablissementUtilisateursPage({ params }: PageProps<"/[lang]/plateforme/etablissements/[etablissementId]/utilisateurs">) {
  const [{ etablissementId }, t, lang] = await Promise.all([params, getT(), getLang()]);
  const e = await getEtablissement(etablissementId);
  if (!e) notFound();
  return (
    <Card>
      <Table>
        <thead>
          <tr>
            <Th>{t("Utilisateur", "User")}</Th>
            <Th>{t("Rôle", "Role")}</Th>
            <Th>{t("Statut", "Status")}</Th>
            <Th>{t("Dernière connexion", "Last sign-in")}</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {e.utilisateurs.length === 0 && <LigneVide colSpan={5} texte={t("Aucun compte.", "No accounts.")} />}
          {e.utilisateurs.map((u) => (
            <tr key={u.id}>
              <Td><Personne nom={`${u.civilite} ${u.prenom} ${u.nom}`} detail={u.email} /></Td>
              <Td>{t(...LIBELLE_ROLE[u.role])}</Td>
              <Td><Badge ton={ton(STATUT_COMPTE, u.statut)}>{lib(STATUT_COMPTE, u.statut, t)}</Badge></Td>
              <Td className="text-muted">{derniereConnexion(u.derniereConnexion, lang)}</Td>
              <Td className="text-right">
                <ActionButton action={actionCompte.bind(null, u.id, "reinitialiser")}>{t("Réinitialiser", "Reset")}</ActionButton>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <p className="mt-3 text-xs text-muted">{t("Les enseignants et les parents utilisent l'application mobile ; leurs comptes sont gérés par l'établissement.", "Teachers and parents use the mobile app; their accounts are managed by the school.")}</p>
    </Card>
  );
}
