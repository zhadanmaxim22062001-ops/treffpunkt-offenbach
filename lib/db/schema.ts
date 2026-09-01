import { boolean, date, index, integer, numeric, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * OF-Radar schema. Read this file before touching /admin/radar or the ingest
 * script — the shape here encodes real decisions, not just column names.
 *
 * ORIGIN, AND WHY IT EXISTS
 * Every item carries origin: 'feed' | 'manual'. The feed audit found that the
 * city's own Meldungen feed (offenbach.de) covers rathaus, baustelle,
 * frequenz and stadt well — it's the Rathaus publishing about itself, the
 * best possible source. It found nothing usable for foerderung or recht:
 * Förderdatenbank, WIBank, IHK and Handwerkskammer either have no feed or
 * one that's currently empty. Those two categories are also the slowest-
 * moving (a handful of items a quarter, not a day) and the highest-liability
 * — a wrong grant deadline or a wrong statement of legal obligation costs a
 * member real money, not just an awkward correction.
 *
 * So the design inverts the usual "automate everything, humans review":
 * foerderung and recht items are only ever origin='manual', composed by a
 * human in /admin/radar with the same fields and the same publish gate as
 * everything else, source name and URL typed in by hand. The classifier
 * never authors those two categories — see lib/radar/classify.ts (step 4b)
 * for where that rule actually gets enforced in code, not just in this
 * comment. rathaus/baustelle/frequenz/stadt can be either origin, since a
 * human should still be able to add something the feed missed.
 */

export const radarCategory = pgEnum("radar_category", ["rathaus", "baustelle", "foerderung", "frequenz", "stadt", "recht"]);
export const radarUrgency = pgEnum("radar_urgency", ["low", "mid", "high"]);
export const radarStatus = pgEnum("radar_status", ["draft", "published", "rejected"]);
export const radarOrigin = pgEnum("radar_origin", ["feed", "manual"]);

/**
 * Registered automated feeds — bookkeeping for lib/radar/sources.ts entries,
 * not a place items reference for their display data (items carry their own
 * sourceName/sourceUrl so the public page never needs a join). Rows here
 * only ever get an origin='feed' item's sourceId; manual items leave it null.
 */
export const sources = pgTable("sources", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(), // matches the key in lib/radar/sources.ts, e.g. "offenbach-de"
  name: text("name").notNull(),
  feedUrl: text("feed_url").notNull(),
  licenceNote: text("licence_note"),
  active: boolean("active").notNull().default(true),
  lastFetchedAt: timestamp("last_fetched_at", { withTimezone: true }),
  lastSuccessAt: timestamp("last_success_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const items = pgTable(
  "items",
  {
    id: serial("id").primaryKey(),
    // Hash of the canonical source URL — how we dedupe on ingest. Manual
    // items get one too (hashed from the typed-in sourceUrl), so a manually
    // entered item and a later feed item about the same thing don't both
    // publish.
    urlHash: text("url_hash").notNull().unique(),
    origin: radarOrigin("origin").notNull(),
    sourceId: integer("source_id").references(() => sources.id),
    status: radarStatus("status").notNull().default("draft"),
    category: radarCategory("category").notNull(),
    // Expected values mirror lib/members.ts Branche, plus "alle" for
    // everyone — kept as text[] rather than an enum since this is filter
    // metadata, not a constraint the DB needs to enforce.
    audience: text("audience").array().notNull().default(sql`ARRAY[]::text[]`),
    streets: text("streets").array().notNull().default(sql`ARRAY[]::text[]`),
    urgency: radarUrgency("urgency").notNull().default("mid"),
    // Only ever set when the source text states one explicitly — never
    // inferred, never estimated. Null means no deadline, not "unknown."
    deadline: date("deadline"),
    headlineDe: text("headline_de").notNull(),
    summaryDe: text("summary_de").notNull(),
    // Points at what to check and where. Never legal, tax or financial
    // advice, never "you must do X by Y" — the association carries the
    // liability for what this field says. Enforced by the classifier prompt
    // for origin='feed' items and by the admin's own judgment for
    // origin='manual' ones; this column doesn't and can't enforce it itself.
    actionDe: text("action_de").notNull(),
    sourceName: text("source_name").notNull(),
    sourceUrl: text("source_url").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("items_status_idx").on(table.status),
    index("items_public_list_idx").on(table.status, table.category, table.publishedAt),
  ],
);

/**
 * Double opt-in. confirmedAt is null until the confirmation link is clicked
 * — that moment, not requestedAt, is the actual DSGVO consent timestamp,
 * since a bare subscribe request isn't valid consent by itself. Unsubscribe
 * is a hard delete of the row (see lib/radar/digest.ts, step 4e) — no
 * separate "unsubscribed" state to retain, since there's no reason to keep
 * a withdrawn subscriber's email at all.
 */
export const digestSubscribers = pgTable("digest_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  confirmToken: text("confirm_token").notNull(),
  unsubscribeToken: text("unsubscribe_token").notNull().unique(),
  requestedAt: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
});

/**
 * One row per /api/radar/ingest run. Exists so token spend is a number
 * someone can actually look at, not a surprise on the Anthropic invoice —
 * see the cost estimate in README's OF-Radar section. cappedAt is true when
 * the run hit its hard item-count ceiling and stopped early rather than
 * processing everything a busy news week produced.
 */
export const ingestRuns = pgTable("ingest_runs", {
  id: serial("id").primaryKey(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  itemsFetched: integer("items_fetched").notNull().default(0),
  itemsNew: integer("items_new").notNull().default(0),
  itemsClassified: integer("items_classified").notNull().default(0),
  promptTokens: integer("prompt_tokens").notNull().default(0),
  completionTokens: integer("completion_tokens").notNull().default(0),
  estimatedCostUsd: numeric("estimated_cost_usd", { precision: 10, scale: 4 }).notNull().default("0"),
  cappedAt: boolean("capped_at").notNull().default(false),
  error: text("error"),
});
