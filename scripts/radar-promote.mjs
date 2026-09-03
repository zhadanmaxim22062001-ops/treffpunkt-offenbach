// Moves ONE proposal from data/radar.inbox.json into data/radar.json,
// generating a slug and stripping the inbox-only fields. This is a
// convenience, not a gate — editing data/radar.json by hand is equally
// valid and needs no script at all.
//
// Usage: npm run radar:promote -- <id>
// (npm needs the -- to forward the id; `node scripts/radar-promote.mjs <id>`
// works the same way without it)

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const INBOX_PATH = `${ROOT}data/radar.inbox.json`;
const RADAR_PATH = `${ROOT}data/radar.json`;

const RADAR_CATEGORIES = ["rathaus", "baustelle", "foerderung", "frequenz", "stadt", "recht"];
const RADAR_URGENCIES = ["low", "mid", "high"];

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

function isValidIsoDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());
}

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return fallback;
  }
}

function fail(message) {
  console.error(`\nAbgebrochen: ${message}`);
  process.exitCode = 1;
}

async function main() {
  const id = process.argv[2];
  const inbox = await readJson(INBOX_PATH, { proposals: [] });

  if (!id) {
    console.log("Usage: npm run radar:promote -- <id>\n");
    if (inbox.proposals?.length) {
      console.log("Offene Vorschläge in data/radar.inbox.json:");
      for (const p of inbox.proposals) {
        const ready = p.headlineDe?.trim() ? "bereit" : "noch offen";
        console.log(`  ${p.id}  [${ready}]  ${p.headlineSource}`);
      }
    } else {
      console.log("data/radar.inbox.json enthält aktuell keine Vorschläge.");
    }
    process.exitCode = 1;
    return;
  }

  const index = (inbox.proposals ?? []).findIndex((p) => p.id === id);
  if (index === -1) {
    fail(`Kein Vorschlag mit der ID "${id}" in ${INBOX_PATH}.`);
    return;
  }
  const p = inbox.proposals[index];

  if (!p.sourceName || !p.sourceUrl) {
    fail("sourceName oder sourceUrl fehlt — jede Meldung braucht eine nachprüfbare Quelle.");
    return;
  }
  if (!isValidIsoDate(p.date)) {
    fail(`"date" ist kein gültiges ISO-Datum (YYYY-MM-DD): ${p.date}`);
    return;
  }
  if (p.deadline != null && !isValidIsoDate(p.deadline)) {
    fail(`"deadline" ist gesetzt, aber kein gültiges ISO-Datum: ${p.deadline}`);
    return;
  }
  if (!RADAR_CATEGORIES.includes(p.category)) {
    fail(`"category" fehlt oder ist ungültig: ${p.category}. Erlaubt: ${RADAR_CATEGORIES.join(", ")}`);
    return;
  }
  if (!RADAR_URGENCIES.includes(p.urgency)) {
    fail(`"urgency" fehlt oder ist ungültig: ${p.urgency}. Erlaubt: ${RADAR_URGENCIES.join(", ")}`);
    return;
  }
  if (!p.headlineDe?.trim() || !p.summaryDe?.trim() || !p.actionDe?.trim()) {
    fail("headlineDe, summaryDe und actionDe müssen alle drei von Hand ausgefüllt sein, bevor veröffentlicht wird.");
    return;
  }

  const radar = await readJson(RADAR_PATH, { items: [] });
  const isPlaceholder = typeof radar._note === "string" && radar._note.includes("TODO-COPY");

  const existingSlugs = new Set((isPlaceholder ? [] : radar.items).map((item) => item.slug));
  let slug = slugify(p.headlineDe);
  let suffix = 2;
  while (existingSlugs.has(slug)) {
    slug = `${slugify(p.headlineDe)}-${suffix}`;
    suffix++;
  }

  const newItem = {
    slug,
    category: p.category,
    headline: p.headlineDe.trim(),
    summary: p.summaryDe.trim(),
    action: p.actionDe.trim(),
    sourceName: p.sourceName,
    sourceUrl: p.sourceUrl,
    date: p.date,
    urgency: p.urgency,
    deadline: p.deadline ?? null,
    origin: "manual",
  };

  if (isPlaceholder) {
    delete radar._note;
    radar.items = [newItem];
    console.log("\nErster echter Eintrag: die Platzhalter-Beispiele wurden entfernt und RADAR_ITEMS_ARE_PLACEHOLDER");
    console.log("wird dadurch false. Vor dem Commit unbedingt `git diff data/radar.json` ansehen.");
  } else {
    radar.items = [...radar.items, newItem];
  }

  inbox.proposals = inbox.proposals.filter((_, i) => i !== index);

  await writeFile(RADAR_PATH, JSON.stringify(radar, null, 2) + "\n");
  await writeFile(INBOX_PATH, JSON.stringify(inbox, null, 2) + "\n");

  console.log(`\nVeröffentlicht: ${slug}  (${newItem.category}, ${newItem.urgency})`);
  console.log(`${RADAR_PATH} und ${INBOX_PATH} aktualisiert. Jetzt: git diff ansehen, dann committen.`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
