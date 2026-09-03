// Shared between scripts/radar-fetch.mjs (local, proposes everything in
// scope for a human to write up) and scripts/radar-auto-calendar.mjs (CI,
// auto-publishes only the clear calendar events among them) — one source
// list and one Offenbach filter, so the two paths can never quietly drift
// apart on what "in scope" means.

import { createHash } from "node:crypto";

/**
 * The full source list. Two feeds, both verified working in the earlier feed
 * audit (see README's "v2, parked" section for that audit's full reasoning).
 * That volume — roughly two dozen items a week between them — does not
 * justify a database or a cron job; it justifies a script.
 *
 * `alwaysInScope: true` means the Offenbach pre-filter below is skipped for
 * that source. Only offenbach.de gets that: it's the city's own feed, so
 * every item is already about Offenbach even when a terse headline like
 * "Sozialamt am Freitag geschlossen" doesn't repeat the city's name. Running
 * the same filter against it would silently drop genuine city content for
 * no reason. of-news.de is regional (Kreis Offenbach, not just the city),
 * so it gets the real filter.
 */
export const SOURCES = [
  {
    name: "Offenbach.de Meldungen",
    url: "https://www.offenbach.de/buerger_innen/meldungen/index.php?sp:out=rss",
    licence:
      "Amtlicher Meldungs-Feed der Stadt Offenbach selbst. robots.txt erlaubt automatisierten Zugriff. " +
      "Öffentliche Verwaltungsmitteilung, keine Drittinhalte.",
    alwaysInScope: true,
  },
  {
    name: "OF-News.de",
    url: "https://of-news.de/feed/",
    licence:
      "Lokales Nachrichtenportal, WordPress-Standardfeed. robots.txt erlaubt automatisierten Zugriff. " +
      "RSS liefert Titel und Teaser, keinen Volltext — wir übernehmen ohnehin nie mehr als das.",
    alwaysInScope: false,
  },
];

/*
 * Explicitly NOT included, so nobody re-adds them without re-reading this:
 *
 * - hessenschau.de (ARD): ARD-Angebote stehen unter einem Nutzungsvorbehalt,
 *   der eine automatisierte Weiterverarbeitung nicht abdeckt — auch ein
 *   reiner Titel/Link-Auszug ist damit zu unsicher für eine Vereinsseite.
 * - op-online.de: robots.txt untersagt automatisierten Zugriff (Disallow
 *   greift projektweit). Das wird hier respektiert, auch für einen
 *   gelegentlichen Handlauf — nicht nur für einen Dauer-Crawler.
 */

/**
 * Offenbach pre-filter — no LLM, just a keyword gate. of-news.de covers the
 * whole Kreis Offenbach: Heusenstamm, Dudenhofen, Neu-Isenburg, Seligenstadt
 * and Dreieich all show up in its feed regularly, and none of that is
 * relevant to an Offenbach city-centre business. An item passes if its
 * title or snippet mentions "Offenbach" or one of the terms below.
 *
 * Deliberately short. These are the districts and streets already used
 * elsewhere in this codebase's real content (data/verein.ts, data/members.ts,
 * the radar items themselves) — extend it if a real Offenbach item keeps
 * getting dropped for not matching, but don't pad it with guessed street
 * names just to widen the net.
 */
export const OFFENBACH_TERMS = [
  "offenbach",
  "bieber",
  "bürgel",
  "buergel",
  "rumpenheim",
  "lauterborn",
  "waldheim",
  "tempelsee",
  "kaiserlei",
  "nordend",
  "senefelder quartier",
  "mathildenviertel",
  "frankfurter straße",
  "frankfurter strasse",
  "wilhelmsplatz",
  "marktplatz",
];

export function isInScope(source, text) {
  if (source.alwaysInScope) return true;
  const lower = text.toLowerCase();
  return OFFENBACH_TERMS.some((term) => lower.includes(term));
}

export function shortHash(text) {
  return createHash("sha256").update(text).digest("hex").slice(0, 16);
}

export function toIsoDate(item) {
  const raw = item.isoDate ?? item.pubDate;
  const parsed = raw ? new Date(raw) : null;
  if (parsed && !Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

export function padEnd(text, width) {
  const t = String(text ?? "");
  return t.length >= width ? t.slice(0, width - 1) + "…" : t.padEnd(width);
}
