// Fetches candidate OF-Radar items from a short, hand-picked list of feeds and
// writes them as PROPOSALS to data/radar.inbox.json. Never touches
// data/radar.json — that file is only ever edited by a human (or by
// scripts/radar-promote.mjs, which is the same thing with fewer keystrokes).
//
// Runs on your machine only. Never on Vercel — there is no cron, no server
// route, nothing that runs this automatically. Publishing a real item is
// always: run this, read the table, write two German sentences yourself (or
// let the classifier draft them if ANTHROPIC_API_KEY is set), promote, commit.
// Git is the editorial gate.
//
// Usage: npm run radar:fetch

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import Parser from "rss-parser";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const INBOX_PATH = `${ROOT}data/radar.inbox.json`;
const SEEN_PATH = `${ROOT}data/radar.seen.json`;
const ENV_LOCAL_PATH = `${ROOT}.env.local`;

// Stop after this many NEW items per run, even if a feed carries more —
// keeps a single run reviewable and keeps a runaway feed from flooding the
// inbox. Anything past the cap is simply left unseen and picked up next run.
const MAX_ITEMS_PER_RUN = 25;

// Bump this whenever CLASSIFY_SYSTEM_PROMPT changes in a way that would
// change a real classification, so old proposals in the inbox stay
// traceable to the rules that produced them.
const PROMPT_VERSION = "radar-classify-v1";

// Haiku 4.5 — cheap enough that the earlier cost estimate (see README, "~$1–3
// /month") holds even if every item gets classified. Figures below are an
// approximation for the terminal cost readout only, not billing data — check
// https://www.anthropic.com/pricing for current rates before trusting them
// for anything that matters.
const MODEL = "claude-haiku-4-5-20251001";
const APPROX_USD_PER_MTOK_IN = 1;
const APPROX_USD_PER_MTOK_OUT = 5;

/**
 * The full source list. Two feeds, both verified working in the earlier feed
 * audit (see README's "v2, parked" section for that audit's full reasoning).
 * That volume — roughly two dozen items a week between them — does not
 * justify a database or a cron job; it justifies a script you run when you
 * feel like checking.
 */
const SOURCES = [
  {
    name: "Offenbach.de Meldungen",
    url: "https://www.offenbach.de/buerger_innen/meldungen/index.php?sp:out=rss",
    licence:
      "Amtlicher Meldungs-Feed der Stadt Offenbach selbst. robots.txt erlaubt automatisierten Zugriff. " +
      "Öffentliche Verwaltungsmitteilung, keine Drittinhalte.",
  },
  {
    name: "OF-News.de",
    url: "https://of-news.de/feed/",
    licence:
      "Lokales Nachrichtenportal, WordPress-Standardfeed. robots.txt erlaubt automatisierten Zugriff. " +
      "RSS liefert Titel und Teaser, keinen Volltext — wir übernehmen ohnehin nie mehr als das.",
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

const RADAR_CATEGORIES = ["rathaus", "baustelle", "foerderung", "frequenz", "stadt", "recht"];

// These two rubrics carry the most liability if we get them wrong — a wrong
// funding deadline or a wrong legal claim is a false-statement problem, not
// a typo. They stay hand-written, always. This is enforced below in code,
// not just requested in the prompt, so a model that ignores its instructions
// still can't get German copy onto these two categories unsupervised.
const NEVER_MACHINE_AUTHORED_CATEGORIES = new Set(["foerderung", "recht"]);

const CLASSIFY_SYSTEM_PROMPT = `Du bewertest eine einzelne Meldung aus Offenbach für den OF-Radar, ein Filter für \
Gewerbetreibende in der Offenbacher Innenstadt (Handel, Gastronomie, Handwerk, Dienstleistung). Die einzige Frage: \
ändert diese Meldung etwas für einen Betrieb dort? Die meisten Meldungen tun das nicht.

Regeln, unbedingt einhalten:
- Sei sehr zurückhaltend mit relevant:true. Eine Meldung, die zu oft fälschlich als relevant markiert wird, wird \
innerhalb eines Monats ignoriert; eine übersehene Grenzmeldung kostet fast nichts. Im Zweifel relevant:false.
- Erfinde niemals eine Frist. "deadline" ist nur gesetzt, wenn die Quelle selbst explizit ein Datum nennt — sonst \
immer null.
- "action_de" darf keine Rechts-, Steuer- oder Finanzberatung sein. Sag, was zu prüfen ist und wo — nicht, was \
rechtlich gilt. Der Verein haftet für das, was auf seiner Seite steht.
- "headline_de": maximal 70 Zeichen, eigene Formulierung, kein Zitat der Quelle.
- "summary_de": genau zwei Sätze, eigene Formulierung.
- "action_de": genau ein Satz.

Antworte NUR mit einem JSON-Objekt, keine Erklärung davor oder danach, in genau dieser Form:
{"relevant": true oder false, "category": eine von ${JSON.stringify(RADAR_CATEGORIES)} oder null, \
"urgency": "low" oder "mid" oder "high", "deadline": "YYYY-MM-DD" oder null, "headline_de": "...", \
"summary_de": "...", "action_de": "..."}

Wenn relevant:false ist, setze category auf null und headline_de/summary_de/action_de auf leere Strings — dann muss \
niemand Text lesen, der ohnehin nicht erscheint.`;

async function loadEnvLocal() {
  const env = {};
  try {
    const text = await readFile(ENV_LOCAL_PATH, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  } catch {
    // No .env.local — fine, we just run unclassified.
  }
  return env;
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

function isValidIsoDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());
}

/**
 * Calls the Anthropic Messages API directly via fetch — no SDK dependency
 * for one classification call per item. Fails open: a network error or a
 * malformed response leaves the item unclassified rather than crashing the
 * whole run, so one bad response never costs you the rest of the table.
 */
async function classifyItem(apiKey, { title, snippet }) {
  const userText = `Titel: ${title}\nAuszug: ${snippet || "(kein Auszug verfügbar)"}`;

  let res;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 512,
        system: CLASSIFY_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userText }],
      }),
    });
  } catch (err) {
    console.error(`  Klassifizierung fehlgeschlagen (Netzwerk): ${err.message}`);
    return null;
  }

  if (!res.ok) {
    console.error(`  Klassifizierung fehlgeschlagen (HTTP ${res.status}): ${await res.text().catch(() => "")}`);
    return null;
  }

  const body = await res.json();
  const usage = body.usage ?? { input_tokens: 0, output_tokens: 0 };
  const text = body.content?.[0]?.text ?? "";

  let parsed;
  try {
    const jsonText = text.trim().replace(/^```json\s*/i, "").replace(/```$/, "");
    parsed = JSON.parse(jsonText);
  } catch {
    console.error(`  Klassifizierung fehlgeschlagen (kein gültiges JSON): ${text.slice(0, 200)}`);
    return { usage };
  }

  return { parsed, usage };
}

function padEnd(text, width) {
  const t = String(text ?? "");
  return t.length >= width ? t.slice(0, width - 1) + "…" : t.padEnd(width);
}

function printTable(rows) {
  const cols = [
    ["Datum", 10],
    ["Quelle", 22],
    ["Titel", 60],
    ["Einordnung", 28],
  ];
  console.log(cols.map(([label, w]) => padEnd(label, w)).join(" "));
  console.log(cols.map(([, w]) => "-".repeat(w)).join(" "));
  for (const row of rows) {
    console.log(cols.map(([, w], i) => padEnd(row[i], w)).join(" "));
  }
}

async function main() {
  const env = await loadEnvLocal();
  const apiKey = env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;

  const seen = await readJson(SEEN_PATH, {});
  const inbox = await readJson(INBOX_PATH, { proposals: [] });

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
      const hash = shortHash(link);
      if (hash in seen) continue;
      candidates.push({ source, item, link, hash });
    }
  }

  // Oldest first within the combined list, so a run that hits the cap
  // proposes the items that have been waiting longest.
  candidates.sort((a, b) => toIsoDate(a.item).localeCompare(toIsoDate(b.item)));
  const batch = candidates.slice(0, MAX_ITEMS_PER_RUN);

  if (batch.length === 0) {
    console.log("Nichts Neues — beide Feeds bereits vollständig gesehen.");
    return;
  }

  console.log(`${batch.length} neue Meldung(en), ${apiKey ? "mit" : "ohne"} Klassifizierung.\n`);

  const newProposals = [];
  const tableRows = [];
  let totalIn = 0;
  let totalOut = 0;
  let classifiedCount = 0;

  for (const { source, item, link, hash } of batch) {
    const date = toIsoDate(item);
    const id = `${date}-${hash.slice(0, 8)}`;

    const proposal = {
      id,
      status: "new",
      relevant: null,
      category: null,
      headlineDe: "",
      summaryDe: "",
      actionDe: "",
      urgency: null,
      deadline: null,
      sourceName: source.name,
      sourceUrl: link,
      headlineSource: item.title.trim(),
      date,
      promptVersion: null,
      fetchedAt: new Date().toISOString(),
    };

    let classification = "unclassifiziert";

    if (apiKey) {
      const result = await classifyItem(apiKey, {
        title: item.title.trim(),
        snippet: item.contentSnippet?.trim().slice(0, 600),
      });
      if (result?.usage) {
        totalIn += result.usage.input_tokens ?? 0;
        totalOut += result.usage.output_tokens ?? 0;
      }
      if (result?.parsed) {
        classifiedCount++;
        const p = result.parsed;
        const blockedCategory = p.category && NEVER_MACHINE_AUTHORED_CATEGORIES.has(p.category);

        proposal.relevant = Boolean(p.relevant);
        proposal.category = RADAR_CATEGORIES.includes(p.category) ? p.category : null;
        proposal.urgency = ["low", "mid", "high"].includes(p.urgency) ? p.urgency : null;
        proposal.deadline = isValidIsoDate(p.deadline) ? p.deadline : null;
        proposal.promptVersion = PROMPT_VERSION;

        if (blockedCategory) {
          // Highest-liability rubrics: never machine-authored, full stop —
          // enforced here regardless of what the model returned above.
          proposal.status = "needs_human";
          proposal.headlineDe = "";
          proposal.summaryDe = "";
          proposal.actionDe = "";
          classification = `needs_human (${p.category})`;
        } else if (proposal.relevant) {
          proposal.status = "classified";
          proposal.headlineDe = String(p.headline_de ?? "").slice(0, 70);
          proposal.summaryDe = String(p.summary_de ?? "");
          proposal.actionDe = String(p.action_de ?? "");
          classification = `${proposal.category ?? "?"} / ${proposal.urgency ?? "?"}`;
        } else {
          proposal.status = "classified";
          classification = "nicht relevant";
        }
      }
    }

    newProposals.push(proposal);
    seen[hash] = { url: link, firstSeen: proposal.fetchedAt };
    tableRows.push([date, source.name, item.title.trim(), classification]);
  }

  printTable(tableRows);

  inbox.proposals = [...(inbox.proposals ?? []), ...newProposals];
  inbox.generatedAt = new Date().toISOString();

  await writeFile(INBOX_PATH, JSON.stringify(inbox, null, 2) + "\n");
  await writeFile(SEEN_PATH, JSON.stringify(seen, null, 2) + "\n");

  console.log(`\n${newProposals.length} Vorschlag/Vorschläge in ${INBOX_PATH} geschrieben.`);
  if (apiKey) {
    const costIn = (totalIn / 1_000_000) * APPROX_USD_PER_MTOK_IN;
    const costOut = (totalOut / 1_000_000) * APPROX_USD_PER_MTOK_OUT;
    console.log(
      `Klassifiziert: ${classifiedCount}/${batch.length}. Tokens: ${totalIn} in / ${totalOut} out. ` +
        `Geschätzte Kosten: ~$${(costIn + costOut).toFixed(4)} (Näherung, siehe anthropic.com/pricing).`,
    );
  } else {
    console.log("Kein ANTHROPIC_API_KEY in .env.local — unklassifiziert geschrieben. Deutsche Texte selbst schreiben.");
  }
  console.log("data/radar.json wurde NICHT verändert. Zum Veröffentlichen: npm run radar:promote <id>");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
