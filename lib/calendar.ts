import { getAllEvents, hasConfirmedDate } from "@/lib/events";
import { RADAR_ITEMS_ARE_PLACEHOLDER, getRadarItems, type RadarItem } from "@/lib/radar-content";
import type { Event } from "@/data/content";
import { parseIso, compareDates, isWithinRange, type CalendarDate } from "@/lib/date-berlin";

type CalendarEntryBase = {
  key: string;
  /** ISO. Same as dateEnd for a single-day entry. */
  dateStart: string;
  dateEnd: string;
  title: string;
  href: string;
};

/**
 * A real discriminated union (not `source` plus a loose `RadarItem | Event`
 * union on `item`) so switching on `entry.source` actually narrows
 * `entry.item`'s type — the OF-Radar month calendar's day panel needs that
 * to pick RadarItemBody vs VereinEventBody without a cast. The full
 * original record travels with the entry either way, so rendering an
 * entry's details reuses the same components that already render a
 * RadarItem/Event elsewhere, rather than re-deriving a second flattened
 * shape to render from.
 */
export type CalendarEntry =
  | (CalendarEntryBase & { source: "radar"; item: RadarItem })
  | (CalendarEntryBase & { source: "verein"; item: Event });

/**
 * One list, one source of truth for "when will people be in the Innenstadt":
 * the association's own confirmed events (data/content.ts — only ones with a
 * board-confirmed date, same guard /veranstaltungen already uses, isoEnd
 * carried through so multi-day events like Offenbacher Woche span their real
 * range) merged with frequenz-category OF-Radar items (data/radar.json).
 * Feeds the month calendar at the top of /radar and the homepage teaser.
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
      dateStart: e.isoStart,
      dateEnd: e.isoEnd ?? e.isoStart,
      title: e.title,
      href: `/veranstaltungen/${e.slug}`,
      source: "verein",
      item: e,
    }));

  const radarFrequenz: CalendarEntry[] = RADAR_ITEMS_ARE_PLACEHOLDER
    ? []
    : getRadarItems()
        .filter((item) => item.category === "frequenz")
        .map((item) => ({
          key: `radar-${item.slug}`,
          dateStart: item.date,
          dateEnd: item.date,
          title: item.headline,
          href: `/radar/${item.slug}`,
          source: "radar",
          item,
        }));

  return [...events, ...radarFrequenz].sort((a, b) => a.dateStart.localeCompare(b.dateStart));
}

/** Every entry whose [dateStart, dateEnd] range includes `iso` — a multi-day
 *  entry like Offenbacher Woche matches on all four of its days, not just
 *  the first. */
export function entriesOnDate(entries: CalendarEntry[], iso: string): CalendarEntry[] {
  const date = parseIso(iso);
  return entries.filter((e) => isWithinRange(date, parseIso(e.dateStart), parseIso(e.dateEnd)));
}

/** Every entry touching the given month at all — including a multi-day entry
 *  that starts in the previous month or ends in the next one, so it still
 *  marks its days that DO fall in the displayed month. */
export function entriesTouchingMonth(entries: CalendarEntry[], year: number, month: number): CalendarEntry[] {
  const monthStart: CalendarDate = { y: year, m: month, d: 1 };
  const monthEnd: CalendarDate = { y: month === 12 ? year + 1 : year, m: month === 12 ? 1 : month + 1, d: 1 };
  return entries.filter((e) => {
    const start = parseIso(e.dateStart);
    const end = parseIso(e.dateEnd);
    // ranges overlap iff start < monthEnd && end >= monthStart
    return compareDates(start, monthEnd) < 0 && compareDates(end, monthStart) >= 0;
  });
}

/** The next entry starting on or after `iso`, earliest first — used for the
 *  "keine Termine am <Datum>, aber am <nächstes Datum>" fallback link. */
export function nextEntryOnOrAfter(entries: CalendarEntry[], iso: string): CalendarEntry | undefined {
  const date = parseIso(iso);
  return entries
    .filter((e) => compareDates(parseIso(e.dateStart), date) >= 0)
    .sort((a, b) => a.dateStart.localeCompare(b.dateStart))[0];
}
