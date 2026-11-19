// Layout racine : <html lang>, police, styles, fournisseur de langue pour les Client Components.
// Toutes les routes vivent sous /[lang] (fr | en) — cf. guide i18n de Next 16.
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { I18nProvider } from "@/lib/i18n/client";
import { hasLocale, LOCALES } from "@/lib/i18n/config";
import "../globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "SchoolConnect", template: "%s · SchoolConnect" },
  description: "L'école, plus proche de vous. · School, closer to you.",
  icons: { icon: "/logo-schoolconnect.png" },
};

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    <html lang={lang} className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <I18nProvider lang={lang}>{children}</I18nProvider>
      </body>
    </html>
  );
}
