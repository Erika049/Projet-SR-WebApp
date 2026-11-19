// Fonction sans équivalent dans le backend SchoolConnect : aucune donnée fictive n'est affichée.
import { Indisponible } from "@/components/layout/indisponible";

export default function Page() {
  return <Indisponible titre={["Abonnements", "Subscriptions"]} fonction={["La gestion des abonnements", "Subscription management"]} />;
}
