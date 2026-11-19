/** Concatène des classes CSS en ignorant les valeurs vides. */
export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** « Amina Etame » → « AE » ; « M. Kamga » → « K » */
export function initiales(nom: string) {
  return nom
    .replace(/^(M\.|Mme)\s+/, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((m) => m[0]?.toUpperCase())
    .join("");
}

export const nomComplet = (p: { prenom: string; nom: string }) => `${p.prenom} ${p.nom}`;
export const nomCivil = (p: { civilite: string; nom: string }) => `${p.civilite} ${p.nom}`;

/** Construit une URL en conservant/remplaçant des paramètres de recherche. */
export function avecParams(base: string, params: Record<string, string | number | undefined | null>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  const s = sp.toString();
  return s ? `${base}?${s}` : base;
}

export function premier(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}
