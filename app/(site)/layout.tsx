import type { Metadata } from "next";
import { archivo, newsreader, plexMono } from "@/lib/fonts";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollProgress, SmoothScroll } from "@/components/motion";
import { VEREIN } from "@/data/verein";
import "../globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.treffpunkt-offenbach.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Treffpunkt Offenbach — Gewerbeverein für die Innenstadt",
    template: "%s · Treffpunkt Offenbach",
  },
  description:
    "Der Gewerbeverein Treffpunkt Offenbach e. V. belebt die Innenstadt, vernetzt über hundert Betriebe und vertritt ihre Interessen. Mit dem OF-Radar: Meldungen aus Offenbach, gefiltert auf das, was Unternehmen betrifft.",
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: VEREIN.shortName,
  },
  icons: {
    icon: [{ url: "/brand/favicon.svg", type: "image/svg+xml" }, { url: "/brand/favicon-32.png", sizes: "32x32" }],
    apple: "/brand/apple-touch-icon.png",
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: VEREIN.name,
  alternateName: VEREIN.shortName,
  url: SITE_URL,
  email: VEREIN.email,
  telephone: VEREIN.phoneE164,
  address: {
    "@type": "PostalAddress",
    streetAddress: VEREIN.street,
    postalCode: VEREIN.zip,
    addressLocality: VEREIN.city,
    addressCountry: "DE",
  },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${archivo.variable} ${newsreader.variable} ${plexMono.variable}`}>
      <head>
        {/* without JS, motion would leave blocks at opacity 0 — content must always be visible */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <a
          href="#inhalt"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-accent focus:px-4 focus:py-2 focus:font-display focus:text-on-accent"
        >
          Zum Inhalt springen
        </a>
        <SmoothScroll />
        <ScrollProgress />
        <Header />
        <main id="inhalt">{children}</main>
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </body>
    </html>
  );
}
