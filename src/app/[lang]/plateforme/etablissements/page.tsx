// Route : /[lang]/plateforme/etablissements — Établissements de la plateforme (CU-SAD-01).
import Link from "next/link";
import { Building2 } from "lucide-react";
import { getLang, getT } from "@/lib/i18n/server";
import { listerEtablissements } from "@/lib/api/backend";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LigneVide, Table, Td, Th } from "@/components/ui/data-table";

export default async function EtablissementsPage() {
  const [t, lang, etablissements] = await Promise.all([getT(), getLang(), listerEtablissements()]);
  return (
    <>
      <PageHeader
        titre={t("Établissements", "Schools")}
        actions={
          <Link href={`/${lang}/plateforme/etablissements/nouveau`} className="inline-flex items-center gap-2 rounded-lg bg-navy-700 px-4 py-2 text-sm font-semibold text-white">
            <Building2 className="size-4" /> {t("Créer un établissement", "Create a school")}
          </Link>
        }
      />
      <PageBody>
        <Card>
          <Table>
            <thead><tr><Th>{t("Nom", "Name")}</Th><Th>{t("Code", "Code")}</Th><Th>{t("Ville", "City")}</Th><Th>{t("Sous-système", "Subsystem")}</Th><Th>{t("Statut", "Status")}</Th></tr></thead>
            <tbody>
              {etablissements.length === 0 && <LigneVide colSpan={5} texte={t("Aucun établissement.", "No school.")} />}
              {etablissements.map((e) => (
                <tr key={e.id}>
                  <Td><Link href={`/${lang}/plateforme/etablissements/${e.id}`} className="font-semibold text-navy-700 hover:underline">{e.nom}</Link></Td>
                  <Td className="font-mono text-xs">{e.code}</Td>
                  <Td>{e.ville ?? "—"}</Td>
                  <Td>{e.sousSysteme.toLowerCase()}</Td>
                  <Td><Badge ton={e.statut === "ACTIF" ? "succes" : "alerte"}>{e.statut.toLowerCase()}</Badge></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </PageBody>
    </>
  );
}
