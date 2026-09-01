import type { Metadata } from "next";
import { archivo, newsreader, plexMono } from "@/lib/fonts";
import "../globals.css";

/**
 * A separate root layout from app/(site)/layout.tsx — deliberately, not by
 * accident. /admin/radar has one real constraint: usable one-handed on a
 * phone by a volunteer standing in their shop. The public Header and Footer
 * (full nav, newsletter links, a "Mitglied werden" CTA) added nothing here
 * and roughly tripled the scroll distance to the actual controls, which is
 * the opposite of what a review screen needs. No SmoothScroll either —
 * plain, immediate scrolling suits a utility tool better than the eased
 * scroll the public site uses.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${archivo.variable} ${newsreader.variable} ${plexMono.variable}`}>
      <body className="bg-paper text-ink">{children}</body>
    </html>
  );
}
