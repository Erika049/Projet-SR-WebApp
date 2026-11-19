import Image from "next/image";
import logo from "../../../public/logo-schoolconnect.png";
import { cn } from "@/lib/utils";

/**
 * Logo officiel SchoolConnect (livre ouvert, deux personnages, toque).
 * Fichier : public/logo-schoolconnect.png (version optimisée, fond transparent).
 * Les icônes du navigateur sont dans src/app/icon.png, apple-icon.png et favicon.ico.
 */
export function Logo({ taille = 40, avecNom = false, className, nomClassName }: { taille?: number; avecNom?: boolean; className?: string; nomClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image src={logo} alt="SchoolConnect" height={taille} style={{ width: "auto", height: taille }} priority />
      {avecNom && <span className={cn("text-lg font-bold text-navy-800", nomClassName)}>SchoolConnect</span>}
    </span>
  );
}
