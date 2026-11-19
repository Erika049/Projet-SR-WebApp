"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";

/** Zone de dépôt de fichier (import CSV, pièce jointe). Affiche le nom et la taille du fichier choisi. */
export function FileDropzone({ name, accept, libelle, aide }: { name: string; accept?: string; libelle: string; aide?: string }) {
  const [fichier, setFichier] = useState<File | null>(null);
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-navy-200 bg-navy-50/40 px-4 py-8 text-center transition hover:bg-navy-50">
      <UploadCloud className="size-7 text-navy-500" />
      <span className="text-sm font-semibold text-navy-700">{fichier ? fichier.name : libelle}</span>
      <span className="text-xs text-muted">{fichier ? `${Math.max(1, Math.round(fichier.size / 1024))} Ko` : aide}</span>
      <input type="file" name={name} accept={accept} className="sr-only" onChange={(e) => setFichier(e.target.files?.[0] ?? null)} />
    </label>
  );
}
