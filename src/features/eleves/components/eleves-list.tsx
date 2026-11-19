// Liste des élèves : consultation (direction) ou gestion (secrétariat).
import Link from "next/link";
import { getLang, getT } from "@/lib/i18n/server";
import { numeroPage, texteRecherche } from "@/lib/api/pagination";
import { LIAISON, lib, ton } from "@/lib/labels";
import { premier } from "@/lib/utils";
import { listerEleves } from "@/features/eleves/queries";
import { listerClasses } from "@/features/parametrage/queries";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LigneVide, Pagination, Table, Td, Th } from "@/components/ui/data-table";
import { Personne } from "@/components/ui/avatar";

type SP = Record<string, string | string[] | undefined>;

export async function ElevesList({ sp, espace }: { sp: SP; espace: "direction" | "secretariat" }) {
  const [t, lang, classes] = await Promise.all([getT(), getLang(), listerClasses()]);
  const filtres = {
    q: texteRecherche(sp.q),
    classeId: premier(sp.classe) || undefined,
    liaison: premier(sp.liaison) || undefined,
    dossier: premier(sp.dossier) || undefined,
    page: numeroPage(sp.page),
  };
  const page = await listerEleves(filtres);
  const base = `/${lang}/${espace}/eleves`;

  return (
    <Card>
      <form method="get" className="mb-4 flex flex-wrap items-end gap-2">
        <input name="q" defaultValue={filtres.q} placeholder={t("Nom, matricule ou tuteur…", "Name, ID or guardian…")} className="input max-w-xs" />
        <select name="classe" defaultValue={filtres.classeId ?? ""} className="input w-auto">
          <option value="">{t("Toutes les classes", "All classes")}</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.libelle}</option>
          ))}
        </select>
        <select name="liaison" defaultValue={filtres.liaison ?? ""} className="input w-auto">
          <option value="">{t("Accès parent : tous", "Parent access: all")}</option>
          <option value="liee">{t("Liée", "Linked")}</option>
          <option value="en_attente">{t("En attente", "Pending")}</option>
          <option value="non_liee">{t("Non liée", "Not linked")}</option>
        </select>
        {espace === "secretariat" && (
          <select name="dossier" defaultValue={filtres.dossier ?? ""} className="input w-auto">
            <option value="">{t("Dossier : tous", "File: all")}</option>
            <option value="complet">{t("Complet", "Complete")}</option>
            <option value="incomplet">{t("Incomplet", "Incomplete")}</option>
          </select>
        )}
        <button className="rounded-lg bg-navy-700 px-4 py-2 text-sm font-semibold text-white">{t("Filtrer", "Filter")}</button>
        {(filtres.q || filtres.classeId || filtres.liaison || filtres.dossier) && (
          <Link href={base} className="px-2 py-2 text-sm font-semibold text-navy-700 hover:underline">{t("Réinitialiser", "Reset")}</Link>
        )}
      </form>
      <Table>
        <thead>
          <tr>
            <Th>{t("Matricule", "ID")}</Th>
            <Th>{t("Nom", "Name")}</Th>
            <Th>{t("Classe", "Class")}</Th>
            <Th>{t("Tuteur", "Guardian")}</Th>
            <Th>{t("Accès parent", "Parent access")}</Th>
            <Th>{espace === "secretariat" ? t("Dossier", "File") : t("Statut", "Status")}</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {page.items.length === 0 && <LigneVide colSpan={7} texte={t("Aucun élève ne correspond à la recherche.", "No student matches your search.")} />}
          {page.items.map((e) => (
            <tr key={e.id}>
              <Td className="font-mono text-xs">{e.matricule}</Td>
              <Td><Personne nom={`${e.prenom} ${e.nom}`} /></Td>
              <Td>{e.classe.libelle}</Td>
              <Td className="text-muted">{e.tuteur.nom}</Td>
              <Td><Badge ton={ton(LIAISON, e.liaison)}>{lib(LIAISON, e.liaison, t)}</Badge></Td>
              <Td>
                {espace === "secretariat" ? (
                  <Badge ton={e.dossierComplet ? "succes" : "alerte"}>{e.dossierComplet ? t("Complet", "Complete") : t("Incomplet", "Incomplete")}</Badge>
                ) : (
                  <Badge ton={e.redoublant ? "alerte" : "succes"}>{e.redoublant ? t("Redoublant", "Repeating") : t("Actif", "Active")}</Badge>
                )}
              </Td>
              <Td className="text-right">
                <Link href={`${base}/${e.id}`} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-navy-700 hover:bg-navy-50">
                  {espace === "secretariat" ? t("Ouvrir", "Open") : t("Consulter", "View")}
                </Link>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pagination
        page={page.page}
        total={page.total}
        taille={page.taille}
        base={base}
        params={{ q: filtres.q || undefined, classe: filtres.classeId, liaison: filtres.liaison, dossier: filtres.dossier }}
        t={t}
      />
    </Card>
  );
}
