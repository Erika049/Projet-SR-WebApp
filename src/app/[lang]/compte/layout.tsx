// « Mon compte » est accessible à tous les rôles web.
import { AppShell } from "@/components/layout/app-shell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AppShell roles={["super_admin", "direction", "secretariat", "surveillant", "comptable"]}>{children}</AppShell>;
}
