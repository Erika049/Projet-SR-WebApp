"use client";

import { Printer } from "lucide-react";
import { classesBouton } from "@/components/ui/button";

export function PrintButton({ libelle }: { libelle: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={classesBouton("primaire")}>
      <Printer className="size-4" />
      {libelle}
    </button>
  );
}
