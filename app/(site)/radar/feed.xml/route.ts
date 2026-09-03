import { RADAR_ITEMS_ARE_PLACEHOLDER, getRadarItems, isRadarItemVisible } from "@/lib/radar-content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.treffpunkt-offenbach.com";

// Same hourly revalidation as the homepage, and for the same reason: which
// items are current depends on "today" (30-day window, frequenz event
// dates, deadlines — see lib/radar-content.ts's isRadarItemVisible), so this
// can't be force-static the way a feed with no aging logic could be.
export const revalidate = 3600;

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
 * Plain RSS 2.0 for the OF-Radar — file-based, from data/radar.json, only
 * items still current as of the request (see isRadarItemVisible). Empty but
 * valid while RADAR_ITEMS_ARE_PLACEHOLDER is true, so a feed reader that already
 * subscribed doesn't see an error, just nothing to show yet.
 */
export function GET() {
  const today = new Date().toISOString().slice(0, 10);
  const items = RADAR_ITEMS_ARE_PLACEHOLDER ? [] : getRadarItems().filter((item) => isRadarItemVisible(item, today));
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
