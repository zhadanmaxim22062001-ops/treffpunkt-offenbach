import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { formats: ["image/avif", "image/webp"] },
  async redirects() {
    // старые .php-адреса treffpunkt-offenbach.com / treffpunkt-of.de
    return [
      { source: "/index.htm", destination: "/", permanent: true },
      { source: "/leistungen/aktuell.php", destination: "/veranstaltungen", permanent: true },
      { source: "/leistungen/formulare.php", destination: "/mitglied-werden", permanent: true },
      { source: "/company/vorstand.php", destination: "/verein", permanent: true },
      { source: "/company/impressum.php", destination: "/impressum", permanent: true },
      { source: "/company/datenschutz.php", destination: "/datenschutz", permanent: true },
    ];
  },
};

export default nextConfig;
