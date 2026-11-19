// Fonction sans équivalent dans le backend SchoolConnect : aucune donnée fictive n'est affichée.
import { Indisponible } from "@/components/layout/indisponible";

export default function Page() {
  return <Indisponible titre={["Utilisateurs et audit", "Users and audit"]} fonction={["Le journal d'audit de la plateforme", "The platform audit log"]} />;
}
