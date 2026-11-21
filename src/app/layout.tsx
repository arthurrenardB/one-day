import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { InAppGate } from "@/components/InAppGate";
import { Tracker } from "@/components/Tracker";
import { SITE_URL } from "@/lib/site";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "One Day · Relancer une conversation (Tinder, Hinge, Insta) avec l'IA",
    template: "%s · One Day",
  },
  description:
    "Ta conv est morte ? Colle son dernier message ou une capture : One Day te dit si ça vaut le coup de relancer, t'écrit 3 relances dans ton style et le bon moment pour les envoyer. Paiement unique, sans abonnement.",
  alternates: { canonical: "/" },
  // Code de vérification Google Search Console (variable GOOGLE_SITE_VERIFICATION).
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
  openGraph: {
    title: "One Day · Relance tes convs",
    description: "Analyse de ta conv, 3 relances dans ton style et le bon moment pour les envoyer. Sans abonnement.",
    locale: "fr_FR",
    type: "website",
    siteName: "One Day",
  },
};

export const viewport: Viewport = { themeColor: "#f6f4f0" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className={`${geist.variable} font-sans antialiased`}>
        <InAppGate />
        <Tracker />
        {children}
      </body>
    </html>
  );
}
