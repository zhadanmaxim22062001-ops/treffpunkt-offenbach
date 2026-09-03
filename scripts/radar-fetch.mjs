// Fetches candidate OF-Radar items from a short, hand-picked list of feeds and
// writes them as PROPOSALS to data/radar.inbox.json. Never touches
// data/radar.json — that file is only ever edited by a human (or by
// scripts/radar-promote.mjs, which is the same thing with fewer keystrokes).
//
// Runs on your machine only — this script never runs in CI. The GitHub
// Actions workflow (.github/workflows/radar-auto-calendar.yml,
// scripts/radar-auto-calendar.mjs) is a separate, narrower path: it shares
// the same source list and Offenbach filter (scripts/lib/radar-sources.mjs)
// but only ever auto-publishes clear-cut frequenz calendar entries straight
// to data/radar.json via a pull request. It never writes to this script's
// inbox — business-list items (the other five categories) are never
// automatic, full stop. This script is how a human proposes and writes up
// anything else.
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
import Parser from "rss-parser";
import { SOURCES, isInScope, shortHash, toIsoDate, padEnd } from "./lib/radar-sources.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const INBOX_PATH = `${ROOT}data/radar.inbox.json`;
const SEEN_PATH = `${ROOT}data/radar.seen.json`;

// Stop after this many NEW items per run, even if a feed carries more —
// keeps a single run reviewable and keeps a runaway feed from flooding the
// inbox. Anything past the cap is simply left unseen and picked up next run.
const MAX_ITEMS_PER_RUN = 25;

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return fallback;
  }
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
