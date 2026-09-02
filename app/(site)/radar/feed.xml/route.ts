import { RADAR_ITEMS_ARE_PLACEHOLDER, getRadarItems } from "@/lib/radar-content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.treffpunkt-offenbach.com";

// Built entirely from data/radar.json at build time, same as /radar itself —
// nothing here depends on the request, so it can be a static, cached file.
export const dynamic = "force-static";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(iso: string): string {
  return new Date(`${iso}T08:00:00+02:00`).toUTCString();
}

/**
 * Plain RSS 2.0 for the OF-Radar — file-based, built from data/radar.json at
 * build time, no different from how /radar itself reads it. Empty but valid
 * while RADAR_ITEMS_ARE_PLACEHOLDER is true, so a feed reader that already
 * subscribed doesn't see an error, just nothing to show yet.
 */
export function GET() {
  const items = RADAR_ITEMS_ARE_PLACEHOLDER ? [] : getRadarItems();
  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date));

  const channelDescription = RADAR_ITEMS_ARE_PLACEHOLDER
    ? "Der OF-Radar startet in Kürze — noch keine geprüften Meldungen."
    : "Meldungen aus Offenbach, gefiltert auf das, was Betriebe betrifft.";

  const itemsXml = sorted
    .map((item) => {
      const url = `${SITE_URL}/radar/${item.slug}`;
      return [
        "  <item>",
        `    <title>${escapeXml(item.headline)}</title>`,
        `    <link>${url}</link>`,
        `    <guid isPermaLink="true">${url}</guid>`,
        `    <pubDate>${toRfc822(item.date)}</pubDate>`,
        `    <description>${escapeXml(item.summary)}</description>`,
        "  </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "<channel>",
    "  <title>OF-Radar · Treffpunkt Offenbach</title>",
    `  <link>${SITE_URL}/radar</link>`,
    `  <description>${escapeXml(channelDescription)}</description>`,
    "  <language>de-DE</language>",
    itemsXml,
    "</channel>",
    "</rss>",
  ].join("\n");

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
