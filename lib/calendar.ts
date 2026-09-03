import { getAllEvents, hasConfirmedDate } from "@/lib/events";
import { RADAR_ITEMS_ARE_PLACEHOLDER, getRadarItems } from "@/lib/radar-content";

export type CalendarEntry = {
  key: string;
  date: string; // ISO
  title: string;
  href: string;
  source: "verein" | "radar";
};

/**
 * One list, one source of truth for "when will people be in the Innenstadt":
 * the association's own confirmed events (data/content.ts — only ones with a
 * board-confirmed date, same guard /veranstaltungen already uses) merged
 * with frequenz-category OF-Radar items (data/radar.json). Feeds the 12-week
 * timeline at the top of /radar and the homepage teaser.
 *
 * Deliberately independent of RADAR_ITEMS_ARE_PLACEHOLDER for the events
 * half — the association's own confirmed events are real regardless of
 * whether any radar item has ever been published, and this calendar is the
 * one part of the module reliable enough to lead the page with.
 */
export function getCalendarEntries(): CalendarEntry[] {
  const events: CalendarEntry[] = getAllEvents()
    .filter(hasConfirmedDate)
    .map((e) => ({
      key: `event-${e.slug}`,
      date: e.isoStart,
      title: e.title,
      href: `/veranstaltungen/${e.slug}`,
      source: "verein",
    }));

  const radarFrequenz: CalendarEntry[] = RADAR_ITEMS_ARE_PLACEHOLDER
    ? []
    : getRadarItems()
        .filter((item) => item.category === "frequenz")
        .map((item) => ({
          key: `radar-${item.slug}`,
          date: item.date,
          title: item.headline,
          href: `/radar/${item.slug}`,
          source: "radar",
        }));

  return [...events, ...radarFrequenz].sort((a, b) => a.date.localeCompare(b.date));
}
