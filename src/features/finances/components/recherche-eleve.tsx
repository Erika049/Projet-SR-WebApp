// Recherche d'un élève (nom, prénom, matricule) dans le répertoire du backend, avec lien vers une page cible.
import Link from "next/link";
import { getT } from "@/lib/i18n/server";
import { repertoire } from "@/lib/api/backend";
import { Card } from "@/components/ui/card";
import { LigneVide, Table, Td, Th } from "@/components/ui/data-table";
import { SearchInput } from "@/components/ui/search-input";

export async function RechercheEleve({ q, lien }: { q: string; lien: (eleveId: string) => string }) {
  const [t, eleves] = await Promise.all([getT(), repertoire()]);
  const recherche = q.trim().toLowerCase();
  const liste = recherche ? eleves.filter((e) => `${e.nom} ${e.prenom} ${e.matricule}`.toLowerCase().includes(recherche)) : eleves;
  return (
    <Card>
      <div className="mb-4">
        <SearchInput defaut={q} placeholder={t("Nom, prénom ou matricule", "Name or student ID")} libelleBouton={t("Rechercher", "Search")} />
      </div>
      <Table>
        <thead><tr><Th>{t("Élève", "Student")}</Th><Th>{t("Matricule", "Student ID")}</Th><Th>{t("Classe", "Class")}</Th></tr></thead>
        <tbody>
          {liste.length === 0 && <LigneVide colSpan={3} texte={t("Aucun élève trouvé.", "No student found.")} />}
          {liste.slice(0, 30).map((e) => (
            <tr key={e.eleveId}>
              <Td><Link href={lien(e.eleveId)} className="font-semibold text-navy-700 hover:underline">{e.nom} {e.prenom}</Link></Td>
              <Td className="font-mono text-xs">{e.matricule}</Td>
              <Td>{e.classeNom ?? "—"}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
