// Runs in GitHub Actions only (.github/workflows/radar-auto-calendar.yml),
// daily. This is the ONE part of OF-Radar allowed to publish without a
// human writing the copy — and even then, only calendar (frequenz) entries,
// and only the ones that are unambiguous "this is a public event" hits.
//
// The split is not negotiable:
// - CALENDAR entries can be automatic. They carry only what the source
//   itself states — title, date, place, link — no interpretation. An
//   automatically published item never gets a "Was das für Sie heißt" line;
//   see RadarItem.action in lib/radar-content.ts, optional for exactly this.
// - BUSINESS-LIST items (rathaus, baustelle, foerderung, stadt, recht) are
//   NEVER touched by this script. It doesn't even look at their content —
//   anything that isn't a clear-cut calendar event just becomes a link in
//   the pull request body for a human to look at, never written to any
//   JSON file.
//
// Reuses the same source list, Offenbach filter, and seen.json dedup ledger
// as scripts/radar-fetch.mjs (see scripts/lib/radar-sources.mjs) — an item
// this script surfaces (auto-published or listed for review) is marked seen
// exactly like a locally-fetched proposal would be, so the two paths never
// re-propose the same URL to each other.
//
// Writes data/radar.json and data/radar.seen.json directly. The GitHub
// Actions workflow is responsible for turning that into a branch + pull
// request — this script never commits or pushes anything itself.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { appendFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import Parser from "rss-parser";
import { SOURCES, OFFENBACH_TERMS, isInScope, shortHash, toIsoDate } from "./lib/radar-sources.mjs";

// Place terms only — "offenbach" itself isn't a place within the city, so
// it's excluded here even though it's part of the broader Offenbach filter.
const OFFENBACH_PLACE_TERMS = OFFENBACH_TERMS.filter((t) => t !== "offenbach");

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const RADAR_PATH = `${ROOT}data/radar.json`;
const SEEN_PATH = `${ROOT}data/radar.seen.json`;

const MAX_ITEMS_PER_RUN = 25;

// Positive signal: this reads like a public event, not a notice. Kept to
// unambiguous event nouns — a market, a festival, a guided tour. Deliberately
// misses plenty of real events rather than risk a false positive; missed
// ones simply show up under "Zur Prüfung" for a human to catch instead.
const EVENT_KEYWORDS = [
  "markt", "fest", "führung", "fuehrung", "tour", "wanderung", "konzert",
  "ausstellung", "flohmarkt", "kirmes", "festival", "verkaufsoffen",
];

// Negative signal: administrative notices that can otherwise collide with
// the positive list (e.g. a cancelled "Sitzung" is not an event). Any match
// here routes to review regardless of EVENT_KEYWORDS.
const NON_EVENT_KEYWORDS = [
  "entfällt", "entfaellt", "geschlossen", "sitzung", "übung", "uebung",
  "sperrung", "warnung", "geschlossen",
];

const MONTHS = {
  januar: 1, februar: 2, märz: 3, maerz: 3, april: 4, mai: 5, juni: 6,
  juli: 7, august: 8, september: 9, oktober: 10, november: 11, dezember: 12,
};

const GERMAN_DATE_PATTERN = /\bam\s+(\d{1,2})\.\s*([A-Za-zäöüÄÖÜ]+)\b/i;

/** Extracts an explicit "am DD. Monat" date from the source's own title — never inferred, never guessed. */
function extractDate(title, referenceIso) {
  const match = title.match(GERMAN_DATE_PATTERN);
  if (!match) return null;
  const day = Number(match[1]);
  const month = MONTHS[match[2].toLowerCase()];
  if (!month || day < 1 || day > 31) return null;

  const refYear = Number(referenceIso.slice(0, 4));
  const pad2 = (n) => String(n).padStart(2, "0");
  let candidate = `${refYear}-${pad2(month)}-${pad2(day)}`;

  // If that date is more than ~60 days in the past relative to the fetch
  // date, it's almost certainly next year's occurrence (e.g. a January
  // event mentioned in a December feed) — roll forward once.
  const diffDays = (Date.parse(referenceIso) - Date.parse(candidate)) / 86_400_000;
  if (diffDays > 60) candidate = `${refYear + 1}-${pad2(month)}-${pad2(day)}`;

  return Number.isNaN(Date.parse(candidate)) ? null : candidate;
}

/** Best-effort, conservative: only ever a known real place name found verbatim in the title, never a guess. */
function extractPlace(title) {
  for (const term of OFFENBACH_PLACE_TERMS) {
    const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const match = title.match(re);
    if (match) return match[0];
  }
  return undefined;
}

function isClearEvent(title) {
  const lower = title.toLowerCase();
  if (NON_EVENT_KEYWORDS.some((k) => lower.includes(k))) return false;
  return EVENT_KEYWORDS.some((k) => lower.includes(k));
}

function slugify(text) {
  return text
    .toLowerCase()
    .replaceAll("ä", "ae").replaceAll("ö", "oe").replaceAll("ü", "ue").replaceAll("ß", "ss")
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return fallback;
  }
}

async function writeGitHubOutput(name, value) {
  const outPath = process.env.GITHUB_OUTPUT;
  if (!outPath) return;
  await appendFile(outPath, `${name}=${value}\n`);
}

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  const seen = await readJson(SEEN_PATH, {});
  const radar = await readJson(RADAR_PATH, { items: [] });
  const isPlaceholder = typeof radar._note === "string" && radar._note.includes("TODO-COPY");

  const parser = new Parser();
  const candidates = [];

  for (const source of SOURCES) {
    let feed;
    try {
      feed = await parser.parseURL(source.url);
    } catch (err) {
      console.error(`Konnte ${source.name} nicht laden: ${err.message}`);
      continue;
    }
    for (const item of feed.items ?? []) {
      const link = item.link?.trim();
      if (!link || !item.title) continue;
      const text = `${item.title} ${item.contentSnippet ?? ""}`;
      if (!isInScope(source, text)) continue;
      const hash = shortHash(link);
      if (hash in seen) continue;
      candidates.push({ source, item, link, hash });
    }
  }

  candidates.sort((a, b) => toIsoDate(a.item).localeCompare(toIsoDate(b.item)));
  const batch = candidates.slice(0, MAX_ITEMS_PER_RUN);

  if (batch.length === 0) {
    console.log("Nichts Neues — beide Feeds bereits vollständig gesehen (nach Offenbach-Filter).");
    await writeGitHubOutput("has_changes", "false");
    return;
  }

  const existingSlugs = new Set((isPlaceholder ? [] : radar.items).map((i) => i.slug));
  const autoItems = [];
  const reviewLinks = [];

  for (const { source, item, link, hash } of batch) {
    const title = item.title.trim();
    const fetchedIso = toIsoDate(item);

    // All three must come from the source's own title: an event word, an
    // explicit date, AND a recognized Innenstadt place. isInScope only
    // proves "this is Offenbach the city" — a Familienfest on the
    // Buchhügel passes that easily but isn't Innenstadt footfall, so the
    // place check is what actually keeps this to "does this put people on
    // the street where members' shops are." Missing any one of the three
    // routes to review instead of guessing.
    const place = isClearEvent(title) ? extractPlace(title) : undefined;
    const eventDate = place ? extractDate(title, fetchedIso) : null;
    if (place && eventDate) {
      let slug = slugify(title);
      let suffix = 2;
      while (existingSlugs.has(slug)) {
        slug = `${slugify(title)}-${suffix}`;
        suffix++;
      }
      existingSlugs.add(slug);

      autoItems.push({
        slug,
        category: "frequenz",
        headline: title,
        summary: `Termin laut ${source.name}, ${eventDate}, ${place}.`,
        sourceName: source.name,
        sourceUrl: link,
        date: eventDate,
        urgency: "low",
        deadline: null,
        origin: "auto",
        place,
      });
      seen[hash] = { url: link, firstSeen: new Date().toISOString() };
      continue;
    }

    // "Zur Prüfung" is for near-misses, not every administrative notice —
    // items that read like an event but couldn't be auto-confirmed (missing
    // a clean date or a recognized Innenstadt place). Anything that never
    // even looked event-shaped (office closures, drills, meetings) is just
    // marked seen and dropped — surfacing it would recreate exactly the
    // "cries wolf" noise problem the classifier was removed for, just in a
    // pull request instead of an API.
    if (isClearEvent(title)) {
      reviewLinks.push({ title, link, sourceName: source.name, date: fetchedIso });
    }
    seen[hash] = { url: link, firstSeen: new Date().toISOString() };
  }

  console.log(`Auto-veröffentlicht: ${autoItems.length}. Zur Prüfung: ${reviewLinks.length}.\n`);
  for (const i of autoItems) console.log(`  [Kalender] ${i.date}  ${i.headline}`);
  for (const r of reviewLinks) console.log(`  [Prüfung]  ${r.date}  ${r.title}`);

  if (autoItems.length > 0) {
    if (isPlaceholder) {
      delete radar._note;
      radar.items = [...autoItems];
    } else {
      radar.items = [...radar.items, ...autoItems];
    }
    await writeFile(RADAR_PATH, JSON.stringify(radar, null, 2) + "\n");
  }
  await writeFile(SEEN_PATH, JSON.stringify(seen, null, 2) + "\n");

  const prBodyLines =
    autoItems.length > 0
      ? [
          `${autoItems.length} neue Kalender-Eintrag/Einträge, automatisch aus der Quelle übernommen (Titel, Datum, Ort, Link — keine Interpretation):`,
          "",
          ...autoItems.map((i) => `- **${i.date}** — ${i.headline} (${i.sourceName})`),
        ]
      : ["Keine neuen Kalender-Einträge diesmal — nur Kandidaten zur Prüfung unten."];
  if (reviewLinks.length > 0) {
    prBodyLines.push("", "### Zur Prüfung", "", "Kein klarer Kalendertermin oder außerhalb des Kalenders — nicht automatisch übernommen:", "");
    for (const r of reviewLinks) prBodyLines.push(`- [${r.title}](${r.link}) — ${r.sourceName}, ${r.date}`);
  }
  prBodyLines.push(
    "",
    "---",
    "Automatisch erzeugt von `scripts/radar-auto-calendar.mjs`. Kalender-Einträge sind reine Fakten aus der Quelle — Rathaus/Baustellen/Förderung/Stadt/Recht bleiben immer von Hand geschrieben und laufen nie über dieses Skript.",
  );
  const prBodyPath = path.join(process.env.RUNNER_TEMP ?? tmpdir(), "radar-pr-body.md");
  await writeFile(prBodyPath, prBodyLines.join("\n") + "\n");

  await writeGitHubOutput("has_changes", autoItems.length > 0 || reviewLinks.length > 0 ? "true" : "false");
  await writeGitHubOutput("pr_body_path", prBodyPath);
  await writeGitHubOutput("auto_count", String(autoItems.length));
  await writeGitHubOutput("review_count", String(reviewLinks.length));

  console.log(`\nPR-Text geschrieben: ${prBodyPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
