// Espace surveillance générale (CU-SUR-*) : contrôle du rôle « surveillant » puis menu latéral.
import { AppShell } from "@/components/layout/app-shell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AppShell roles={["surveillant"]}>{children}</AppShell>;
}
