"use client";

import { useRef } from "react";
import { X } from "lucide-react";
import { classesBouton, type Taille, type Variante } from "./button";

/** Fenêtre modale native (<dialog>) ouverte par un bouton. Le contenu est généralement un formulaire. */
export function Dialog({
  declencheur,
  titre,
  children,
  variante = "secondaire",
  taille = "sm",
}: {
  declencheur: React.ReactNode;
  titre: string;
  children: React.ReactNode;
  variante?: Variante;
  taille?: Taille;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" className={classesBouton(variante, taille)} onClick={() => ref.current?.showModal()}>
        {declencheur}
      </button>
      <dialog
        ref={ref}
        className="m-auto w-[min(92vw,32rem)] rounded-2xl border border-line bg-white p-0 shadow-xl backdrop:bg-navy-900/40"
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h3 className="font-bold text-ink">{titre}</h3>
          <button type="button" onClick={() => ref.current?.close()} className="rounded-md p-1 text-muted hover:bg-slate-100">
            <X className="size-4" />
          </button>
        </div>
        <div className="p-5" onSubmit={() => setTimeout(() => ref.current?.close(), 0)}>
          {children}
        </div>
      </dialog>
    </>
  );
}
