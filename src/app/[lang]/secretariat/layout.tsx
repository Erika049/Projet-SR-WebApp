// Espace secrétariat / scolarité (CU-SEC-*) : contrôle du rôle « secretariat » puis menu latéral.
import { AppShell } from "@/components/layout/app-shell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AppShell roles={["secretariat"]}>{children}</AppShell>;
}
