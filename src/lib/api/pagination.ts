import type { Page } from "@/types/domain";

export const TAILLE_PAGE = 8;

export function paginer<T>(items: T[], page = 1, taille = TAILLE_PAGE): Page<T> {
  const total = items.length;
  const max = Math.max(1, Math.ceil(total / taille));
  const p = Math.min(Math.max(1, page), max);
  return { items: items.slice((p - 1) * taille, p * taille), total, page: p, taille };
}

export function numeroPage(valeur: string | string[] | undefined): number {
  const n = Number(Array.isArray(valeur) ? valeur[0] : valeur);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

export function texteRecherche(valeur: string | string[] | undefined): string {
  return (Array.isArray(valeur) ? valeur[0] : valeur ?? "").trim();
}

/** Comparaison insensible à la casse et aux accents. */
export function correspond(texte: string, recherche: string): boolean {
  if (!recherche) return true;
  const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  return norm(texte).includes(norm(recherche));
}
