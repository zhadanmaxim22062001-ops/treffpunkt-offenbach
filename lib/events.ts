import { EVENTS, type Event } from "@/data/content";

export function getAllEvents(): Event[] {
  return EVENTS;
}

export function getEventBySlug(slug: string): Event | undefined {
  return EVENTS.find((e) => e.slug === slug);
}

/** True only once a board-confirmed date exists — see data/content.ts for why this matters. */
export function hasConfirmedDate(event: Event): event is Event & { isoStart: string } {
  return typeof event.isoStart === "string";
}

/**
 * The next event with a confirmed date in the future, if any. Used for the
 * homepage's "nächste Veranstaltung" card — which has nothing honest to show
 * as long as every event's date is still open, so it falls back to a
 * different, date-free message instead of picking EVENTS[0] and implying it
 * knows something it doesn't.
 */
export function getNextConfirmedEvent(): (Event & { isoStart: string }) | undefined {
  const today = new Date().toISOString().slice(0, 10);
  return EVENTS.filter(hasConfirmedDate)
    .filter((e) => e.isoStart >= today)
    .sort((a, b) => a.isoStart.localeCompare(b.isoStart))[0];
}
