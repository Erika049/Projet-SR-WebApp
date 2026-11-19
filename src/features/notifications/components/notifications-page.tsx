// Centre de notifications commun aux cinq espaces (maquettes « Notifications »).
import Link from "next/link";
import { Archive, Check } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/dal";
import { getLang, getT } from "@/lib/i18n/server";
import { quand } from "@/lib/format";
import { cn, premier } from "@/lib/utils";
import { listerNotifications, preferencesNotification } from "@/features/notifications/queries";
import { archiver, marquerLue, marquerToutLu } from "@/features/notifications/actions";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { ActionButton } from "@/components/ui/action-button";
import { EmptyState } from "@/components/ui/empty-state";
import { PreferencesForm } from "./preferences-form";

export async function NotificationsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [sp, session, t, lang] = await Promise.all([searchParams, getCurrentUser(), getT(), getLang()]);
  const filtre = (premier(sp.filtre) ?? "toutes") as "toutes" | "non_lues" | "archivees";
  const [{ items, compteurs }, prefs] = await Promise.all([listerNotifications(session.role, filtre), preferencesNotification(session.userId, session.role)]);
  const chemin = `/${lang}/${{ super_admin: "plateforme", direction: "direction", secretariat: "secretariat", surveillant: "surveillance", comptable: "comptabilite" }[session.role]}/notifications`;

  return (
    <>
      <PageHeader titre="Notifications" sousTitre={t(`${compteurs.nonLues} non lue(s)`, `${compteurs.nonLues} unread`)} />
      <PageBody>
        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <Card>
            <CardHeader
              titre="Notifications"
              action={
                compteurs.nonLues > 0 && (
                  <ActionButton action={marquerToutLu} variante="fantome">
                    {t("Tout marquer comme lu", "Mark all as read")}
                  </ActionButton>
                )
              }
            />
            <Tabs
              className="mb-4"
              onglets={[
                { href: chemin, libelle: t("Toutes", "All"), compteur: compteurs.toutes },
                { href: `${chemin}?filtre=non_lues`, libelle: t("Non lues", "Unread"), compteur: compteurs.nonLues },
                { href: `${chemin}?filtre=archivees`, libelle: t("Archivées", "Archived"), compteur: compteurs.archivees },
              ]}
            />
            {items.length === 0 ? (
              <EmptyState titre={t("Aucune notification", "No notifications")} />
            ) : (
              <ul className="divide-y divide-line">
                {items.map((n) => (
                  <li key={n.id} className="flex items-start gap-3 py-3.5">
                    <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.lue ? "bg-transparent" : "bg-brand-600")} />
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm", n.lue ? "font-medium text-slate-600" : "font-bold text-ink")}>
                        {n.lien ? (
                          <Link href={`/${lang}${n.lien}`} className="hover:underline">
                            {n.titre}
                          </Link>
                        ) : (
                          n.titre
                        )}
                      </p>
                      <p className="text-sm text-muted">{n.message}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted">{quand(n.date, lang)}</span>
                    {!n.archivee && (
                      <div className="flex shrink-0 gap-1">
                        {!n.lue && (
                          <ActionButton action={marquerLue.bind(null, n.id)} variante="fantome" className="px-2!">
                            <Check className="size-4" />
                            <span className="sr-only">{t("Marquer comme lu", "Mark as read")}</span>
                          </ActionButton>
                        )}
                        <ActionButton action={archiver.bind(null, n.id)} variante="fantome" className="px-2!">
                          <Archive className="size-4" />
                          <span className="sr-only">{t("Archiver", "Archive")}</span>
                        </ActionButton>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card className="h-fit">
            <CardHeader titre={t("Préférences", "Preferences")} sousTitre={t("Choisissez ce qui vous est signalé.", "Choose what you are notified about.")} />
            <PreferencesForm preferences={prefs} />
          </Card>
        </div>
      </PageBody>
    </>
  );
}
