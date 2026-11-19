// Espace super-administrateur (CU-SAD-*) : contrôle du rôle « super_admin » puis menu latéral.
import { AppShell } from "@/components/layout/app-shell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AppShell roles={["super_admin"]}>{children}</AppShell>;
}
