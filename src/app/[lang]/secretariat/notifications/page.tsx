// Centre de notifications (CU-SYS-01) — composant partagé entre les espaces.
import { NotificationsPage } from "@/features/notifications/components/notifications-page";

export default function Page(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <NotificationsPage searchParams={props.searchParams} />;
}
