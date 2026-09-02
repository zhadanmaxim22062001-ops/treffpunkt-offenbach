import type { Branche } from "@/lib/members";
import type { RadarCategory, RadarItem } from "@/lib/radar-content";

/**
 * "Für mich relevant" is a soft, entirely local re-ranking — no account, no
 * cookie, no server round-trip. A visitor's Branche + Straße live only in
 * their own browser's localStorage; we never see it. There is no per-item
 * targeting data (radar items don't carry a Branche or Straße field, and
 * the parked Drizzle schema — lib/db/schema.ts — doesn't either), so
 * relevance is a best-effort heuristic on top of what each item already
 * says in its own text:
 *
 *   +2  the item's headline/summary/action mentions the visitor's street
 *   +1  the item's category has an editorial affinity with the visitor's
 *       Branche (CATEGORY_BRANCHE_AFFINITY below)
 *
 * This only ever reorders and dims — see RadarList — never hides. Treat
 * the affinity table as a starting point, not a claim of precision; it is
 * a judgment call, documented here so it's easy to see and adjust.
 */

const STORAGE_KEY = "tpof:radar-profile";

export type RadarProfile = {
  branche: Branche;
  strasse: string;
};

// Mirrors the Branche union in lib/members.ts. Duplicated rather than
// imported so the little profile form here doesn't pull the whole members
// module (member list, geocode data) into the client bundle for six strings.
export const BRANCHE_OPTIONS: Branche[] = [
  "Einzelhandel",
  "Gastronomie",
  "Handwerk",
  "Dienstleistung",
  "Gesundheit",
  "Bildung",
];

const CATEGORY_BRANCHE_AFFINITY: Record<RadarCategory, Branche[]> = {
  // Funding, rules, and legal/cost changes apply broadly — no branche filter.
  rathaus: ["Einzelhandel", "Gastronomie", "Handwerk", "Dienstleistung", "Gesundheit", "Bildung"],
  foerderung: ["Einzelhandel", "Gastronomie", "Handwerk", "Dienstleistung", "Gesundheit", "Bildung"],
  recht: ["Einzelhandel", "Gastronomie", "Handwerk", "Dienstleistung", "Gesundheit", "Bildung"],
  // Street-frontage and footfall-driven businesses feel these first.
  baustelle: ["Einzelhandel", "Gastronomie"],
  frequenz: ["Einzelhandel", "Gastronomie"],
  stadt: ["Einzelhandel", "Gastronomie", "Dienstleistung"],
};

export function readProfile(): RadarProfile | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.branche === "string" && typeof parsed?.strasse === "string") return parsed as RadarProfile;
    return null;
  } catch {
    return null;
  }
}

export function writeProfile(profile: RadarProfile): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Private browsing / blocked storage — the toggle just won't persist across visits.
  }
}

export function clearProfile(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do if storage isn't available.
  }
}

export function scoreRelevance(item: RadarItem, profile: RadarProfile): number {
  let score = 0;
  const strasse = profile.strasse.trim().toLowerCase();
  if (strasse) {
    const haystack = `${item.headline} ${item.summary} ${item.action}`.toLowerCase();
    if (haystack.includes(strasse)) score += 2;
  }
  if (CATEGORY_BRANCHE_AFFINITY[item.category]?.includes(profile.branche)) score += 1;
  return score;
}
