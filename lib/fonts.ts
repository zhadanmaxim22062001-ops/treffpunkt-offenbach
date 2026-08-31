import localFont from "next/font/local";

/**
 * Fonts are loaded locally rather than via next/font/google.
 * The reason isn't speed, it's the DSGVO: fetching from Google's servers
 * on render hands them the visitor's IP, and that is exactly what German
 * courts have penalised. Files come from @fontsource (OFL license) and
 * live in /public/fonts.
 */

export const archivo = localFont({
  src: [
    { path: "../public/fonts/archivo-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/archivo-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/archivo-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-archivo",
  display: "swap",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

export const newsreader = localFont({
  src: [
    { path: "../public/fonts/newsreader-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "../public/fonts/newsreader-latin-400-normal.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-newsreader",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const plexMono = localFont({
  src: [{ path: "../public/fonts/ibm-plex-mono-latin-500-normal.woff2", weight: "500", style: "normal" }],
  variable: "--font-plex-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "monospace"],
});
