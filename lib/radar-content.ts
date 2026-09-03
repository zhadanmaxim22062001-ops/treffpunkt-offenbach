import radarData from "@/data/radar.json";

/**
 * v1 OF-Radar: file-based, read at build time. No database, no ingest, no
 * classifier — see README's OF-Radar section for why (v2 work, parked in
 * lib/db and lib/radar/, not deleted). Adding a real item is: edit
 * data/radar.json, commit, done.
 *
 * The field shape here deliberately matches the parked Drizzle schema
 * (lib/db/schema.ts) — category, headline, summary, action, sourceName,
 * sourceUrl, date, urgency, optional deadline, origin — so migrating to the
 * database in v2 is a data move, not a reshape.
 */

export type RadarCategory = "rathaus" | "baustelle" | "foerderung" | "frequenz" | "stadt" | "recht";
export type RadarUrgency = "low" | "mid" | "high";

export type RadarItem = {
  slug: string;
  category: RadarCategory;
  headline: string;
  summary: string;
  action: string;
  sourceName: string;
  sourceUrl: string;
  date: string;
  urgency: RadarUrgency;
  deadline?: string | null;
  origin: "manual";
};

// All six categories share one of two tones now — signal is reserved for
// urgency/deadlines (see the item list), not for telling categories apart.
export const RADAR_CATEGORIES: Record<RadarCategory, { label: string; tone: "accent" | "neutral" }> = {
  rathaus: { label: "Rathaus & Regeln", tone: "accent" },
  baustelle: { label: "Baustellen", tone: "accent" },
  foerderung: { label: "Förderung & Fristen", tone: "accent" },
  frequenz: { label: "Frequenz-Kalender", tone: "accent" },
  stadt: { label: "Stadt entwickelt sich", tone: "accent" },
  recht: { label: "Recht & Kosten", tone: "neutral" },
};

/**
 * True as long as data/radar.json's `_note` still carries TODO-COPY — i.e.
 * the items are specimens for judging the layout, not real published
 * content. Same pattern as MEMBERS_ARE_PLACEHOLDER (lib/members.ts):
 * every place that renders radar items in public checks this first and
 * shows an honest empty state instead. This exists because RADAR_SEED's
 * invented headlines were once found rendering on the homepage attributed
 * to real institutions (Stadt Offenbach, WIBank, IHK Offenbach am Main)
 * that never published any of it — fabricating a fee-schedule change or a
 * road closure and sourcing it to the city an association lobbies is a
 * false-statement problem, not a placeholder problem.
 */
export const RADAR_ITEMS_ARE_PLACEHOLDER =
  typeof (radarData as { _note?: string })._note === "string" && (radarData as { _note?: string })._note!.includes("TODO-COPY");

export function getRadarItems(): RadarItem[] {
  return radarData.items as RadarItem[];
}

export function getRadarItemBySlug(slug: string): RadarItem | undefined {
  return getRadarItems().find((item) => item.slug === slug);
}

export const RADAR_CATEGORY_LIST = Object.keys(RADAR_CATEGORIES) as RadarCategory[];

/**
 * The filterable business list excludes frequenz — those items live in the
 * Innenstadt calendar (lib/calendar.ts) instead, merged with the
 * association's own events. Two different intake standards, not one list:
 * frequenz is low-bar/high-volume ("does this put people on the street"),
 * the other five stay strict ("does this change something for a business
 * owner") — see README's OF-Radar section.
 */
export const RADAR_BUSINESS_CATEGORY_LIST: RadarCategory[] = RADAR_CATEGORY_LIST.filter((c) => c !== "frequenz");
