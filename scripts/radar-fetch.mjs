// Fetches candidate OF-Radar items from a short, hand-picked list of feeds and
// writes them as PROPOSALS to data/radar.inbox.json. Never touches
// data/radar.json — that file is only ever edited by a human (or by
// scripts/radar-promote.mjs, which is the same thing with fewer keystrokes).
//
// Runs on your machine only. Never on Vercel — there is no cron, no server
// route, nothing that runs this automatically. Publishing a real item is
// always: run this, read the table, write two German sentences yourself,
// promote, commit. Git is the editorial gate.
//
// No classifier. There was one, briefly — a direct fetch() to the Messages
// API drafting German copy. The first real run against both feeds found 4
// usable items out of 40 (10%), all of them easy to spot from the headline
// alone. At that hit rate the classifier would have saved a couple of
// minutes of reading per week, at the cost of an API key, per-run tokens,
// and the risk of a confidently-wrong sentence about a funding deadline
// under the association's name. Not a good trade. If the shape of the feeds
// changes later, the reasoning (and the removed code) is in git history —
// see the commit that deleted it.
//
// Usage: npm run radar:fetch

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import Parser from "rss-parser";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const INBOX_PATH = `${ROOT}data/radar.inbox.json`;
const SEEN_PATH = `${ROOT}data/radar.seen.json`;

// Stop after this many NEW items per run, even if a feed carries more —
// keeps a single run reviewable and keeps a runaway feed from flooding the
// inbox. Anything past the cap is simply left unseen and picked up next run.
const MAX_ITEMS_PER_RUN = 25;

/**
 * The full source list. Two feeds, both verified working in the earlier feed
 * audit (see README's "v2, parked" section for that audit's full reasoning).
 * That volume — roughly two dozen items a week between them — does not
 * justify a database or a cron job; it justifies a script you run when you
 * feel like checking.
 *
 * `alwaysInScope: true` means the Offenbach pre-filter below is skipped for
 * that source. Only offenbach.de gets that: it's the city's own feed, so
 * every item is already about Offenbach even when a terse headline like
 * "Sozialamt am Freitag geschlossen" doesn't repeat the city's name. Running
 * the same filter against it would silently drop genuine city content for
 * no reason. of-news.de is regional (Kreis Offenbach, not just the city),
 * so it gets the real filter.
 */
const SOURCES = [
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
const OFFENBACH_TERMS = [
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

function isInScope(source, text) {
  if (source.alwaysInScope) return true;
  const lower = text.toLowerCase();
  return OFFENBACH_TERMS.some((term) => lower.includes(term));
}

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return fallback;
  }
}

function shortHash(text) {
  return createHash("sha256").update(text).digest("hex").slice(0, 16);
}

function toIsoDate(item) {
  const raw = item.isoDate ?? item.pubDate;
  const parsed = raw ? new Date(raw) : null;
  if (parsed && !Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

function padEnd(text, width) {
  const t = String(text ?? "");
  return t.length >= width ? t.slice(0, width - 1) + "…" : t.padEnd(width);
}

function printTable(rows) {
  const cols = [
    ["Datum", 10],
    ["Quelle", 22],
    ["Titel", 66],
  ];
  console.log(cols.map(([label, w]) => padEnd(label, w)).join(" "));
  console.log(cols.map(([, w]) => "-".repeat(w)).join(" "));
  for (const row of rows) {
    console.log(cols.map(([, w], i) => padEnd(row[i], w)).join(" "));
  }
}

async function main() {
  const seen = await readJson(SEEN_PATH, {});
  const inbox = await readJson(INBOX_PATH, { proposals: [] });

  const parser = new Parser();
  const candidates = [];
  const stats = [];

  for (const source of SOURCES) {
    let feed;
    try {
      feed = await parser.parseURL(source.url);
    } catch (err) {
      console.error(`Konnte ${source.name} nicht laden: ${err.message}`);
      stats.push({ name: source.name, total: 0, inScope: 0, dropped: 0, filtered: !source.alwaysInScope });
      continue;
    }

    let total = 0;
    let dropped = 0;

    for (const item of feed.items ?? []) {
      const link = item.link?.trim();
      if (!link || !item.title) continue;
      total++;

      const text = `${item.title} ${item.contentSnippet ?? ""}`;
      if (!isInScope(source, text)) {
        dropped++;
        continue;
      }

      const hash = shortHash(link);
      if (hash in seen) continue;
      candidates.push({ source, item, link, hash });
    }

    stats.push({ name: source.name, total, inScope: total - dropped, dropped, filtered: !source.alwaysInScope });
  }

  console.log("Quelle                 geladen  im Radius  vom Offenbach-Filter verworfen");
  for (const s of stats) {
    const filterNote = s.filtered ? String(s.dropped) : "— (amtliche Quelle, kein Filter)";
    console.log(`${padEnd(s.name, 22)}  ${padEnd(s.total, 7)}  ${padEnd(s.inScope, 9)}  ${filterNote}`);
  }
  console.log("");

  // Oldest first within the combined list, so a run that hits the cap
  // proposes the items that have been waiting longest.
  candidates.sort((a, b) => toIsoDate(a.item).localeCompare(toIsoDate(b.item)));
  const batch = candidates.slice(0, MAX_ITEMS_PER_RUN);

  if (batch.length === 0) {
    console.log("Nichts Neues — beide Feeds bereits vollständig gesehen (nach Offenbach-Filter).");
    return;
  }

  const newProposals = [];
  const tableRows = [];

  for (const { source, item, link, hash } of batch) {
    const date = toIsoDate(item);
    const id = `${date}-${hash.slice(0, 8)}`;

    newProposals.push({
      id,
      sourceName: source.name,
      sourceUrl: link,
      headlineSource: item.title.trim(),
      date,
      fetchedAt: new Date().toISOString(),
      // Filled in by hand before this can be promoted — see
      // scripts/radar-promote.mjs, which refuses to publish until all of
      // these are set.
      category: null,
      headlineDe: "",
      summaryDe: "",
      actionDe: "",
      urgency: null,
      deadline: null,
    });
    seen[hash] = { url: link, firstSeen: new Date().toISOString() };
    tableRows.push([date, source.name, item.title.trim()]);
  }

  printTable(tableRows);

  inbox.proposals = [...(inbox.proposals ?? []), ...newProposals];
  inbox.generatedAt = new Date().toISOString();

  await writeFile(INBOX_PATH, JSON.stringify(inbox, null, 2) + "\n");
  await writeFile(SEEN_PATH, JSON.stringify(seen, null, 2) + "\n");

  console.log(`\n${newProposals.length} Vorschlag/Vorschläge in ${INBOX_PATH} geschrieben, unklassifiziert.`);
  console.log("Deutsche Texte selbst schreiben (category, headlineDe, summaryDe, actionDe, urgency).");
  console.log("data/radar.json wurde NICHT verändert. Zum Veröffentlichen: npm run radar:promote -- <id>");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
