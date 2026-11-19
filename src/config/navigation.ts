// Menus latéraux par espace, d'après les maquettes web.
import {
  Bell, BookOpen, Building2, CalendarClock, ClipboardCheck, CreditCard, FileCheck2, FileText, GraduationCap, Home,
  Inbox, LayoutDashboard, LifeBuoy, Megaphone, Receipt, School, Search, Settings2, ShieldCheck, Tag, TimerReset,
  UserCheck, Users, Wallet, AlertTriangle, BarChart3,
} from "lucide-react";
import type { Espace } from "@/lib/auth/roles";

export type CleBadge = "bulletins" | "demandes" | "justificatifs" | "declarations" | "impayes" | "notifications" | "tickets";

export type EntreeMenu = {
  href: string; // sans préfixe de langue
  libelle: [fr: string, en: string];
  icone: React.ComponentType<{ className?: string }>;
  badge?: CleBadge;
};

export const NAVIGATION: Record<Espace, EntreeMenu[]> = {
  plateforme: [
    { href: "/plateforme", libelle: ["Vue d'ensemble", "Overview"], icone: LayoutDashboard },
    { href: "/plateforme/etablissements", libelle: ["Établissements", "Schools"], icone: Building2 },
    { href: "/plateforme/abonnements", libelle: ["Abonnements", "Subscriptions"], icone: CreditCard },
    { href: "/plateforme/support", libelle: ["Support", "Support"], icone: LifeBuoy, badge: "tickets" },
    { href: "/plateforme/utilisateurs", libelle: ["Utilisateurs et audit", "Users and audit"], icone: ShieldCheck },
    { href: "/plateforme/notifications", libelle: ["Notifications", "Notifications"], icone: Bell, badge: "notifications" },
  ],
  direction: [
    { href: "/direction", libelle: ["Tableau de bord", "Dashboard"], icone: LayoutDashboard },
    { href: "/direction/eleves", libelle: ["Élèves", "Students"], icone: GraduationCap },
    { href: "/direction/personnel", libelle: ["Personnel", "Staff"], icone: Users },
    { href: "/direction/notes-bulletins", libelle: ["Notes & Bulletins", "Marks & Reports"], icone: BookOpen, badge: "bulletins" },
    { href: "/direction/assiduite-personnel", libelle: ["Assiduité du personnel", "Staff attendance"], icone: CalendarClock },
    { href: "/direction/finances", libelle: ["Finances", "Finance"], icone: Wallet },
    { href: "/direction/classes", libelle: ["Classes", "Classes"], icone: School },
    { href: "/direction/tarifs", libelle: ["Tarifs", "Fees"], icone: Tag },
    { href: "/direction/utilisateurs", libelle: ["Utilisateurs et audit", "Users and audit"], icone: ShieldCheck },
    { href: "/direction/annonces", libelle: ["Annonces", "Announcements"], icone: Megaphone },
    { href: "/direction/notifications", libelle: ["Notifications", "Notifications"], icone: Bell, badge: "notifications" },
    { href: "/direction/support", libelle: ["Support", "Support"], icone: LifeBuoy },
    { href: "/direction/parametrage", libelle: ["Paramétrage", "Settings"], icone: Settings2 },
  ],
  secretariat: [
    { href: "/secretariat", libelle: ["Accueil", "Home"], icone: Home },
    { href: "/secretariat/eleves", libelle: ["Élèves", "Students"], icone: GraduationCap },
    { href: "/secretariat/demandes", libelle: ["Demandes", "Requests"], icone: Inbox, badge: "demandes" },
    { href: "/secretariat/annonces", libelle: ["Annonces", "Announcements"], icone: Megaphone },
    { href: "/secretariat/notifications", libelle: ["Notifications", "Notifications"], icone: Bell, badge: "notifications" },
  ],
  surveillance: [
    { href: "/surveillance", libelle: ["Tableau de bord", "Dashboard"], icone: LayoutDashboard },
    { href: "/surveillance/presences", libelle: ["Présences", "Attendance"], icone: ClipboardCheck },
    { href: "/surveillance/justificatifs", libelle: ["Justificatifs", "Absence notes"], icone: FileCheck2, badge: "justificatifs" },
    { href: "/surveillance/retards-sorties", libelle: ["Retards et sorties", "Lates and exits"], icone: TimerReset },
    { href: "/surveillance/assiduite-personnel", libelle: ["Assiduité du personnel", "Staff attendance"], icone: UserCheck },
    { href: "/surveillance/annonces", libelle: ["Annonces", "Announcements"], icone: Megaphone },
    { href: "/surveillance/notifications", libelle: ["Notifications", "Notifications"], icone: Bell, badge: "notifications" },
  ],
  comptabilite: [
    { href: "/comptabilite", libelle: ["Tableau de bord", "Dashboard"], icone: LayoutDashboard },
    { href: "/comptabilite/paiements/nouveau", libelle: ["Enregistrer un paiement", "Record a payment"], icone: Receipt },
    { href: "/comptabilite/declarations", libelle: ["Déclarations", "Declarations"], icone: FileText, badge: "declarations" },
    { href: "/comptabilite/situation", libelle: ["Situation élève", "Student account"], icone: Search },
    { href: "/comptabilite/impayes", libelle: ["Impayés", "Arrears"], icone: AlertTriangle, badge: "impayes" },
    { href: "/comptabilite/rapports", libelle: ["Rapports de caisse", "Cash reports"], icone: BarChart3 },
    { href: "/comptabilite/notifications", libelle: ["Notifications", "Notifications"], icone: Bell, badge: "notifications" },
  ],
};
