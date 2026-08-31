import membersData from "@/data/members.json";
import geocodeData from "@/data/members.geocode.json";

/**
 * True as long as data/members.json still carries its TODO-COPY note — i.e.
 * the member list is still the demo placeholders, not real businesses with
 * consent to publish. Every place that renders member data in public checks
 * this and shows an honest "under construction" state instead, so invented
 * names can't go live by accident. csv-to-members.mjs always carries `_note`
 * forward unchanged, even after a real import — on purpose: going live is a
 * deliberate act, not a side effect of running a script. Once the real list
 * is confirmed and published with consent, remove the TODO-COPY note from
 * data/members.json by hand.
 */
export const MEMBERS_ARE_PLACEHOLDER = typeof (membersData as { _note?: string })._note === "string" && (membersData as { _note?: string })._note!.includes("TODO-COPY");

export type Branche = "Einzelhandel" | "Gastronomie" | "Handwerk" | "Dienstleistung" | "Gesundheit" | "Bildung";

export const BRANCHEN = membersData.branchen as Branche[];

export type OpeningHoursLine = { days: string; hours: string };

export type Member = {
  slug: string;
  name: string;
  branche: Branche;
  street: string;
  houseNumber?: string;
  plz?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: OpeningHoursLine[];
  teaser?: string;
  description?: string;
  logo?: string;
};

export type GeoPoint = { lat: number; lon: number };

const DEFAULT_CITY = "Offenbach am Main";

const GEOCODES: Record<string, GeoPoint | null> = geocodeData;

export function getAllMembers(): Member[] {
  return membersData.members as Member[];
}

export function getMemberBySlug(slug: string): Member | undefined {
  return getAllMembers().find((m) => m.slug === slug);
}

export function getDistinctStreets(): string[] {
  const streets = new Set(getAllMembers().map((m) => m.street));
  return [...streets].sort((a, b) => a.localeCompare(b, "de"));
}

export function getMembersOnSameStreet(member: Member): Member[] {
  return getAllMembers().filter((m) => m.street === member.street && m.slug !== member.slug);
}

export function getMemberCoords(slug: string): GeoPoint | null {
  return GEOCODES[slug] ?? null;
}

/** "Straße Hausnummer, PLZ Ort" — every part after the street is optional and simply omitted. */
export function formatAddress(member: Member): string {
  const line1 = member.houseNumber ? `${member.street} ${member.houseNumber}` : member.street;
  const city = member.city ?? DEFAULT_CITY;
  const line2 = member.plz ? `${member.plz} ${city}` : city;
  return `${line1}, ${line2}`;
}

/**
 * Outbound link to OpenStreetMap — no map rendered on our side (see
 * scripts/geocode-members.mjs for why member pages don't get a local map
 * image). Precise pin when we have coordinates, a text search as a fallback
 * when we don't.
 */
export function getMemberOsmUrl(member: Member): string {
  const coords = getMemberCoords(member.slug);
  if (coords) return `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lon}#map=18/${coords.lat}/${coords.lon}`;
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(formatAddress(member))}`;
}

const DAY_ORDER = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"] as const;
const DAY_NAMES: Record<(typeof DAY_ORDER)[number], string> = {
  Mo: "Monday",
  Di: "Tuesday",
  Mi: "Wednesday",
  Do: "Thursday",
  Fr: "Friday",
  Sa: "Saturday",
  So: "Sunday",
};

function expandDays(days: string): string[] {
  if (/^t(ä|ae)glich$/i.test(days.trim())) return Object.values(DAY_NAMES);
  const range = days.split(/[–-]/).map((d) => d.trim());
  if (range.length === 2 && DAY_ORDER.includes(range[0] as never) && DAY_ORDER.includes(range[1] as never)) {
    const start = DAY_ORDER.indexOf(range[0] as (typeof DAY_ORDER)[number]);
    const end = DAY_ORDER.indexOf(range[1] as (typeof DAY_ORDER)[number]);
    return DAY_ORDER.slice(start, end + 1).map((d) => DAY_NAMES[d]);
  }
  const single = DAY_ORDER.find((d) => d === days.trim());
  return single ? [DAY_NAMES[single]] : [];
}

/**
 * Best-effort conversion of the free-text hours the board will type
 * ("Mo–Fr 09:00–18:00") into schema.org OpeningHoursSpecification. Lines
 * that don't parse cleanly are simply left out of the structured data —
 * they still render as plain text on the page.
 */
export function toOpeningHoursSpecification(hours: OpeningHoursLine[]) {
  return hours
    .map((line) => {
      const days = expandDays(line.days);
      const timeMatch = line.hours.match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/);
      if (!days.length || !timeMatch) return null;
      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: days,
        opens: timeMatch[1],
        closes: timeMatch[2],
      };
    })
    .filter((spec): spec is NonNullable<typeof spec> => spec !== null);
}

export function filterMembers(
  members: Member[],
  filters: { branche?: string; strasse?: string; q?: string },
): Member[] {
  const q = filters.q?.trim().toLowerCase();
  return members.filter((m) => {
    if (filters.branche && m.branche !== filters.branche) return false;
    if (filters.strasse && m.street !== filters.strasse) return false;
    if (q) {
      const haystack = [m.name, m.teaser, m.description, m.branche, m.street].filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}
