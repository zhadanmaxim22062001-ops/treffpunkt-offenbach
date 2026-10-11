import { getAllEvents, hasConfirmedDate } from "@/lib/events";
import { RADAR_ITEMS_ARE_PLACEHOLDER, getRadarItems, type RadarItem } from "@/lib/radar-content";
import type { Event } from "@/data/content";
import { parseIso, compareDates, isWithinRange, toIso, type CalendarDate } from "@/lib/date-berlin";

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
 * `entry.item`'s type — the OF-Radar day row's day panel needs that
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
 * Feeds the day row at the top of /radar and the homepage teaser.
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
          dateEnd: item.dateEnd ?? item.date,
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

/** The next entry starting on or after `iso`, earliest first — used for the
 *  "keine Termine am <Datum>, aber am <nächstes Datum>" fallback link. */
export function nextEntryOnOrAfter(entries: CalendarEntry[], iso: string): CalendarEntry | undefined {
  const date = parseIso(iso);
  return entries
    .filter((e) => compareDates(parseIso(e.dateStart), date) >= 0)
    .sort((a, b) => a.dateStart.localeCompare(b.dateStart))[0];
}

/**
 * The one rule for which day the ten-day row pre-selects, shared between
 * the server (SSR's initial state) and the client (RadarDayRow after
 * paging or "Heute") so the two can never drift apart: today, if it falls
 * in `days` and has an entry; else the first day in `days` that does;
 * else null (an honest "nothing here" rather than forcing a choice).
 */
export function defaultWindowSelection(entries: CalendarEntry[], days: CalendarDate[], todayIso: string): string | null {
  const todayInWindow = days.some((d) => toIso(d) === todayIso);
  if (todayInWindow && entriesOnDate(entries, todayIso).length > 0) return todayIso;
  for (const d of days) {
    const iso = toIso(d);
    if (entriesOnDate(entries, iso).length > 0) return iso;
  }
  return null;
}
