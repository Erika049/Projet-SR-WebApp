// Layout racine : <html lang="fr">, police, styles, langue des Client Components.
// L'application est uniquement en français : toutes les routes vivent sous /fr (le proxy y ramène toute adresse).
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { I18nProvider } from "@/lib/i18n/client";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import "../globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "SchoolConnect", template: "%s · SchoolConnect" },
  description: "L'école, plus proche de vous.",
};

export function generateStaticParams() {
  return [{ lang: DEFAULT_LOCALE }];
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (lang !== DEFAULT_LOCALE) notFound();
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <I18nProvider lang={DEFAULT_LOCALE}>{children}</I18nProvider>
      </body>
    </html>
  );
}
