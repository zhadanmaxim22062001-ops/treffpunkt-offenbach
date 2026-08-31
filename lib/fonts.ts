import localFont from "next/font/local";

/**
 * Шрифты подключены локально, а не через next/font/google.
 * Причина не в скорости, а в DSGVO: обращение к серверам Google при
 * рендере передаёт им IP посетителя, и именно за это в Германии судятся.
 * Файлы взяты из @fontsource (лицензия OFL) и лежат в /public/fonts.
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
