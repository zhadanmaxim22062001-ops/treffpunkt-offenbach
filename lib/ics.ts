import type { Event } from "@/data/content";

/**
 * The standard Europe/Berlin VTIMEZONE block: CEST from the last Sunday in
 * March, CET from the last Sunday in October, per EU Directive 2000/84/EC —
 * the same transition rule every EU timezone shares. Hand-written once,
 * reused for every event, because getting DST wrong here silently shifts a
 * calendar entry by an hour, which is worse than not offering one at all.
 *
 * All current events are date-only (all-day), which sidesteps DST entirely —
 * an all-day iCalendar event carries no time zone. This block exists so that
 * the moment an event gets a real start *time*, buildIcs already emits a
 * correct TZID-qualified DTSTART instead of a floating local time or a UTC
 * offset frozen at generation time.
 */
const VTIMEZONE_EUROPE_BERLIN = [
  "BEGIN:VTIMEZONE",
  "TZID:Europe/Berlin",
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:+0100",
  "TZOFFSETTO:+0200",
  "TZNAME:CEST",
  "DTSTART:19700329T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:+0200",
  "TZOFFSETTO:+0100",
  "TZNAME:CET",
  "DTSTART:19701025T030000",
  "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
].join("\r\n");

function isoDateToIcsDate(iso: string): string {
  return iso.replaceAll("-", "");
}

/** All-day DTEND is exclusive per RFC 5545 — the day after the last day of the event. */
function dayAfter(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function escapeIcsText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function foldLine(line: string): string {
  // RFC 5545 §3.1: lines over 75 octets get folded with a leading space on the continuation.
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let rest = line;
  while (rest.length > 75) {
    parts.push(rest.slice(0, 75));
    rest = " " + rest.slice(75);
  }
  parts.push(rest);
  return parts.join("\r\n");
}

/**
 * Builds a single-event .ics. Only call this once the event has a confirmed
 * isoStart — see lib/events.ts hasConfirmedDate(). Multi-day events (isoEnd
 * set) become one all-day VEVENT spanning the range; single-day events
 * default to one all-day VEVENT for that day.
 */
export function buildIcs(event: Event & { isoStart: string }): string {
  const dtStart = isoDateToIcsDate(event.isoStart);
  const dtEnd = isoDateToIcsDate(dayAfter(event.isoEnd ?? event.isoStart));
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const uid = `${event.slug}@treffpunkt-offenbach.com`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Treffpunkt Offenbach//Veranstaltungen//DE",
    "CALSCALE:GREGORIAN",
    VTIMEZONE_EUROPE_BERLIN,
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${dtStart}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    foldLine(`SUMMARY:${escapeIcsText(event.title)}`),
    foldLine(`DESCRIPTION:${escapeIcsText(event.summary)}`),
    foldLine(`LOCATION:${escapeIcsText(`${event.place}, Offenbach am Main`)}`),
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n") + "\r\n";
}
