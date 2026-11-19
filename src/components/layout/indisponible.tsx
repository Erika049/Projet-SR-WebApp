// Écran d'une fonction qui n'a pas encore d'équivalent dans le backend SchoolConnect :
// aucune donnée fictive n'est affichée à la place.
import { Construction } from "lucide-react";
import { getT } from "@/lib/i18n/server";
import { PageBody, PageHeader } from "./page-header";
import { Card } from "@/components/ui/card";

export async function Indisponible({ titre, fonction }: { titre: [fr: string, en: string]; fonction: [fr: string, en: string] }) {
  const t = await getT();
  return (
    <>
      <PageHeader titre={t(...titre)} />
      <PageBody>
        <Card className="max-w-2xl">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700">
              <Construction className="size-5" />
            </span>
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-ink">{t("Pas encore disponible sur le serveur SchoolConnect", "Not yet available on the SchoolConnect server")}</p>
              <p className="text-muted">
                {t(
                  `${fonction[0]} n'a pas encore d'équivalent dans le backend. Cet écran sera branché dès que la route existera.`,
                  `${fonction[1]} has no backend equivalent yet. This screen will be connected as soon as the route exists.`,
                )}
              </p>
            </div>
          </div>
        </Card>
      </PageBody>
    </>
  );
}
