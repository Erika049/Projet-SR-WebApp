// Recherche d'un élève par nom ou matricule, avec sa situation financière résumée (CU-ECO-01).
import Link from "next/link";
import { getLang, getT } from "@/lib/i18n/server";
import { fcfa } from "@/lib/format";
import { rechercherEleves } from "@/features/finances/queries";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { Personne } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";

export async function RechercheEleve({ q, lien, libelleLien }: { q: string; lien: (id: string) => string; libelleLien: string }) {
  const [t, lang, resultats] = await Promise.all([getT(), getLang(), rechercherEleves(q)]);
  return (
    <Card>
      <SearchInput defaut={q} placeholder={t("Nom ou matricule (ex. Etame, BAF-26-0001)", "Name or ID (e.g. Etame, BAF-26-0001)")} libelleBouton={t("Rechercher", "Search")} />
      {q && resultats.length === 0 && <EmptyState titre={t("Aucun élève trouvé", "No student found")} />}
      {resultats.length > 0 && (
        <ul className="mt-4 divide-y divide-line">
          {resultats.map((s) => (
            <li key={s.eleve.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <Personne nom={`${s.eleve.prenom} ${s.eleve.nom}`} detail={`${s.eleve.matricule} · ${s.classe?.libelle} · ${t("Tuteur", "Guardian")} : ${s.eleve.tuteur.nom}`} />
              <div className="flex items-center gap-3">
                {s.solde === 0 ? <Badge ton="succes">{t("Soldé", "Paid up")}</Badge> : <Badge ton={s.montantEchu ? "danger" : "alerte"}>{t("Solde", "Balance")} {fcfa(s.solde, lang)}</Badge>}
                <Link href={`/${lang}${lien(s.eleve.id)}`} className="rounded-lg bg-navy-700 px-3 py-1.5 text-xs font-semibold text-white">{libelleLien}</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
