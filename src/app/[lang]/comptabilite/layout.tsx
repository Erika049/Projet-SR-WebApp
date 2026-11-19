// Espace comptabilité / économat (CU-ECO-*) : contrôle du rôle « comptable » puis menu latéral.
import { AppShell } from "@/components/layout/app-shell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AppShell roles={["comptable"]}>{children}</AppShell>;
}
