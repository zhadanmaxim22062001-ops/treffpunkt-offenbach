# treffpunkt-offenbach

Website for Gewerbeverein Treffpunkt Offenbach e. V. Next.js 16 (App Router),
TypeScript, Tailwind v4, motion, lenis. Deploys to Vercel, region fra1.

## Running locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build, must pass with zero errors
```

## What's built

- Design system in tokens: `app/globals.css`, three themes (system / light / dark);
- Archivo, Newsreader, IBM Plex Mono fonts — loaded **locally** via `next/font/local`;
  no requests to Google's servers at all, which matters for DSGVO;
- The OF-Siegel mark: `components/Logo.tsx`, the 64px version-switch threshold is
  built in;
- Header with navigation and theme toggle, footer, skip link, Organization JSON-LD;
- The homepage: hero with the mark drawing itself in, animated Kennzahlen, three
  cards, OF-Radar teaser, member marquee, next event, inverted CTA strip;
- `/styleguide` — every component on one page for comparison (noindex'd, not for
  search engines);
- `/impressum` and `/datenschutz` with real association data;
- **`/mitglieder`** — the member directory. Filterable by Branche and Straße plus
  free-text search, filter state lives in `searchParams` so a filtered view is a
  real, shareable, indexable URL. `/mitglieder/[slug]` adds `LocalBusiness`
  JSON-LD, an "other businesses on this street" block, and a link out to
  OpenStreetMap (no map rendered on member pages — see "Member data" below).
  **Currently shows an honest "Verzeichnis im Aufbau" state** — see below.
- **`/mitglied-werden`** — benefits, an open (currently TODO-COPY) fee table, and
  an application form that posts to `/api/mitglied-werden` and sends mail via
  Resend. No database yet — see "Email and forms" below.
- **`/veranstaltungen`** and `/veranstaltungen/[slug]` — event pages with Event
  JSON-LD and an Europe/Berlin-correct `.ics` download, both gated on the event
  actually having a confirmed date — see "Events and dates" below.
- **`/verein`** — the real Vorstand from `data/verein.ts`, with roles. No founding
  year or Satzung yet; the page says so rather than guessing or leaving a gap.
- **`/kontakt`** — the same form component as `/mitglied-werden` with fewer
  fields (name, email, message), plus the one map the site renders locally: the
  association's own address, fetched by `scripts/fetch-verein-map.mjs`.
- 301 redirects from the old `.php` URLs in `next.config.ts`;
- **`/admin/radar`** — the OF-Radar editorial screen: compose a manual item,
  review/edit a draft, publish or discard. Basic-Auth protected, noindex,
  mobile-first. See "OF-Radar" below.
- `tests/visual.spec.ts` (Playwright) — screenshots every route in both themes
  at 1360px and 420px and fails on any console error. See "Visual verification"
  below.

### Route structure

Public pages live under `app/(site)/` (a route group — doesn't affect any
URL), with their own root layout (`app/(site)/layout.tsx`: Header, Footer,
SmoothScroll, Organization JSON-LD). `/admin` has a **separate** root layout
(`app/admin/layout.tsx`) with none of that — see "OF-Radar" below for why
that split exists; it wasn't there from the start and the reason is worth
reading before adding a third area to the app.

### What's left

1. **OF-Radar ingest**: `/api/radar/ingest` on a Vercel Cron, classification
   via the Anthropic API for the feed-fed categories only (`foerderung` and
   `recht` stay manual-only — see "OF-Radar" below). Schema and the editorial
   admin are both done; the classifier's first deliverable is a `--dry-run`
   report on real offenbach.de items, not code merged sight unseen.
2. **OF-Radar public UI**: filters, deadline countdowns, a frequency calendar,
   `/radar/[slug]`, `/radar/feed.xml`, the weekly digest. Currently shows an
   honest empty state — see "OF-Radar" below.
3. Accessibility (axe-core) and performance pass, OG images via `next/og`.
4. Deploy.

## Member data

`data/members.json` currently holds 12 **placeholder** businesses — plausible
generic names, not real companies — flagged with a `_note` field containing
`TODO-COPY`. As long as that marker is present, `MEMBERS_ARE_PLACEHOLDER` in
`lib/members.ts` is `true` and the site refuses to show the placeholder data as
if it were real: `/mitglieder` shows an "under construction" message,
`/mitglieder/[slug]` pages don't exist (`generateStaticParams` returns `[]`,
`dynamicParams` is `false`), and the homepage marquee doesn't render.

### Getting the real list live

1. Send the board `data/member-template.csv` (German column headers, the current
   placeholders filled in as worked examples). Most returned rows will be
   missing several optional columns — that's expected and handled gracefully.
2. `npm run csv:import -- path/to/returned-file.csv` converts it to
   `data/members.json` (auto-generates slugs, validates Branche, skips and
   reports bad rows without crashing).
3. `npm run geocode` resolves each address via Nominatim, so `/mitglieder/[slug]`
   can put a precise pin in its "open in OpenStreetMap" link and a `geo` field in
   the `LocalBusiness` JSON-LD. This is the only thing in the project that talks
   to Nominatim, and only runs when you run it — never during `next build`,
   never at request time. Respects Nominatim's usage policy: a descriptive
   User-Agent with a real contact address
   (`TreffpunktOffenbachWebsite/1.0 (info@treffpunkt-offenbach.com)`) and a
   1.1-second pause between every request. Re-running it is cheap — it skips
   anything already cached.
4. Once the list is confirmed real and every business has consented to being
   published, remove the `TODO-COPY` marker from `data/members.json`'s `_note`
   field by hand. This is deliberately a manual, one-line, conscious step —
   going live isn't a side effect of running a script.

**Member pages don't render a map image.** They used to (a small locally-cached
OpenStreetMap tile crop, fetched once per member at import time) — that was
fine for 12 placeholders but doesn't hold up for the real list: the OSMF tile
usage policy names bulk downloading as prohibited and points heavy or
third-party use at a paid provider, and 100+ members would mean roughly 900
tiles committed into the repo, re-fetched on every re-geocode. A shop's address
is right there in text on the same page anyway, so the map earned very little
for what it cost. `/mitglieder/[slug]` links out to OpenStreetMap instead
(`getMemberOsmUrl` in `lib/members.ts`); `scripts/geocode-members.mjs` explains
the reasoning in full.

The one map the site does render locally is the association's own address on
`/kontakt` — always exactly one address, fetched once by
`npm run map:verein` (`scripts/fetch-verein-map.mjs`), so it doesn't scale
with the member count and stays well inside OSM's policy. Same reasoning as
local fonts: a live map embed would mean every visitor's browser calling a
third party and handing over their IP, which is exactly the problem the site
otherwise avoids.

## Events and dates

`data/content.ts` EVENTS entries only get `isoStart`/`isoEnd` once the board
has actually confirmed a date — the one exception in the whole file is a
comment explaining that 2026's Offenbacher Woche (28–31 May, 28th edition) is
verified as history, not a claim about the next one. Everything else is
`when: "..."` prose without a claimed date.

`lib/events.ts`'s `hasConfirmedDate()` gates both consequences of a date being
public: `/veranstaltungen/[slug]` only emits Event JSON-LD and only shows the
`.ics` download button when it's true (schema.org's `startDate` is required —
a guessed one would be actively wrong, not just missing), and the homepage's
"next event" card falls back to a date-free message via
`getNextConfirmedEvent()` instead of assuming `EVENTS[0]` is next. A wrong
date in someone's calendar or in Google's event results is worse than an
honest "Termin noch offen."

Once a real date exists: `lib/ics.ts` builds the `.ics` client-side
(`components/IcsDownloadButton.tsx`) with a real Europe/Berlin `VTIMEZONE`
block (the actual EU DST transition rule — last Sunday of March and October),
not a floating local time or a UTC offset frozen at generation time. Current
events are all date-only, which sidesteps DST entirely (an all-day
iCalendar event carries no time zone), but the generator is ready for a real
start *time* the moment one exists.

## OF-Radar

The seed items in `data/content.ts` were briefly rendering on the homepage
attributed to real institutions — Stadt Offenbach, WIBank, IHK Offenbach am
Main — that never published any of it. Fixed: `RADAR_ITEMS_ARE_PLACEHOLDER`
gates every public render of the seed (same pattern as the member-list
guard), and every seed item's `source` is now the unmistakably-fake
`"BEISPIELQUELLE (Testdaten)"`. See `data/content.ts` for the full reasoning.
This is why `/radar` currently shows "Der OF-Radar startet in Kürze" instead
of anything from the seed.

### Source audit

Before writing any ingest code, we ran a throwaway script against every
candidate source from the original plan: does a feed exist, does it return
items, headline-only or with summaries, and what do robots.txt and the terms
of use say about automated access. Result, and what it changed:

- **offenbach.de** (city Meldungen feed) — real, working, 26 live items with
  full summaries, `robots.txt: Allow: /`. The strongest possible source: it's
  the Rathaus publishing about itself. Covers **rathaus, baustelle, frequenz,
  stadt** well.
- **of-news.de** — real, working WordPress feed, open `robots.txt`. Local
  news, needs relevance filtering per item but mechanically solid.
- **op-online.de** (Offenbach-Post) — **excluded.** `robots.txt` disallows
  `/` for all agents except two unrelated paths, plus an explicit comment:
  *"The use of robots or other automated means to access www.op-online.de or
  collect or mine data without express permission is strictly prohibited."*
  Unambiguous either way.
- **hessenschau.de** — **excluded, on purpose, not for lack of a working
  feed.** The feed works, but it's Hessen-wide and would need heavy filtering
  for Offenbach relevance anyway, and ARD publishes a "Nutzungsvorbehalt"
  naming AI bots (ClaudeBot among them) it doesn't want touching its content.
  Classifying isn't training, but the association lobbies public
  institutions — it doesn't need a defensible-but-arguable position against a
  public broadcaster to gain a low-yield source. Don't re-add this without
  re-litigating that reasoning.
- **IHK Offenbach am Main** — a real RSS mechanism exists
  (`offenbach.ihk.de/rss/?type=100...`, auto-discovered from their own
  homepage) but currently returns zero items. Worth keeping registered and
  marked fragile — it may simply start publishing through it later — but
  nothing to ingest today.
- **Handwerkskammer Frankfurt-Rhein-Main** and **foerderdatenbank.de** — no
  feed found by either automated discovery or manual inspection of their
  Presse/search pages. Would mean an HTML scraper, not a feed adapter.
- **RMV Verkehrsmeldungen** — no public feed; the only automated path is
  `rmv.de/hapi/`, a registered API requiring its own ToS acceptance. Deferred
  — the city's own feed already covers road closures, and registering for a
  separate API is its own project. Revisit only if Baustellen looks thin
  after a month of real data.

### Manual entry is a first-class feature, not a fallback

The audit's real finding: what has no usable automated feed is exactly
**foerderung** and **recht** — Förderdatenbank, WIBank, IHK, Handwerkskammer.
Those two categories are also the slowest-moving (a handful of items a
quarter, not a day) and the highest-liability: a wrong grant deadline or a
wrong statement of legal obligation costs a member real money, not just an
awkward correction.

So the design inverts the usual shape: automate the fast-moving categories,
hand-curate the slow and dangerous ones. **The classifier never authors
`foerderung` or `recht` items — those are always `origin: 'manual'`,** typed
into `/admin/radar` by a human with the same fields and the same publish gate
as everything else. This takes the LLM out of the liability path entirely for
the two categories where it mattered most, and it means the module is useful
from day one even with zero feeds working.

### Build order: admin before ingest

4c (this admin) was built before 4b (ingest/classifier), deliberately out of
the original step order. Manual entry needs nothing but the schema — no API
key, no cron, no live feed — so building it first means the module is
genuinely usable the day the database exists, gives a place to put real items
to judge the public UI against, and gives the classifier a working review
screen to land its drafts in once it exists, instead of judging it from a
terminal.

**When the classifier is built, its first deliverable is not code merged
sight unseen — it's a `--dry-run` mode** that fetches the live offenbach.de
feed, classifies real items, writes nothing to the database, and prints a
table: headline in, relevant y/n, category, urgency, deadline, generated
headline/summary/action. That table gets reviewed against real Offenbach
items before a single row is written or a cron is armed.

### Admin (`/admin/radar`)

Compose a manual item, review a draft (feed-origin or manual, same screen),
edit it, publish it, or discard it.

- **Auth**: `proxy.ts` (Next 16 renamed `middleware.ts` → `proxy.ts`; this is
  that file) gates the whole `/admin` path with Basic Auth against
  `ADMIN_PASSWORD`. The comparison is constant-time — both the supplied and
  expected password are hashed to a fixed-length SHA-256 digest first, so a
  timing attack can't learn anything from how many leading characters
  matched. Fails closed if `ADMIN_PASSWORD` isn't set (503, not open access).
  `/admin` was already in `robots.txt`'s disallow list from step 1;
  `app/admin/layout.tsx` also sets `noindex` directly.
- **Mobile-first, actually verified**: every control is sized for a thumb, one
  column, no hover-only affordances. Checked at a 390px viewport via
  Playwright screenshots, not just written to look that way.
- **The publish gate**: `lib/radar/validation.ts`'s `itemFormSchema` requires
  `sourceName` and `sourceUrl` — server-side, before the DB is ever touched,
  not left to the NOT NULL columns alone. No item, from either origin, can be
  published without both. Compose always creates `origin: 'manual'`,
  `status: 'draft'` — composing isn't the same act as publishing, even for a
  human typing it directly; the review screen's "Veröffentlichen" is the
  actual gate.
- **Own root layout**: `/admin` does not inherit the public site's Header and
  Footer — see "Route structure" above. That was a real bug caught while
  building this, not a design choice made from the start.

Verified end to end (compose → validation error → success → edit → save →
publish → shows in "Zuletzt veröffentlicht"; discard → removed from the draft
list) against a temporary in-memory fake, since no live Neon project exists
yet. That check caught a real bug: the deadline field's empty-string case
transformed to `undefined` in the form schema, and Drizzle's `.set()` treats
`undefined` as "leave this column alone" — so clearing a previously-set
deadline on edit would have silently failed to clear it. Fixed to transform
to `null`, which Drizzle does write; verified the set-then-clear round-trip
directly.

### Schema (`lib/db/schema.ts`)

Four tables, migrations committed under `drizzle/`:

- **`sources`** — registered feeds (bookkeeping: last fetch, active/inactive),
  not what items display — items carry their own `sourceName`/`sourceUrl` so
  the public page never needs a join.
- **`items`** — `origin: 'feed' | 'manual'` is the load-bearing column
  described above. `deadline` is nullable and only ever set when the source
  states one explicitly — never inferred. `status: draft|published|rejected`
  is the editorial gate: nothing reaches the public site without a human
  approving it, regardless of origin. `classifierVersion` is nullable and
  only ever set by the ingest script on machine-classified rows — null for
  every manual item — so a prompt can be tuned against real published
  history later instead of guesswork.
- **`digest_subscribers`** — double opt-in; `confirmedAt` (not the initial
  request) is the actual consent timestamp, since a bare subscribe request
  isn't valid consent by itself. Unsubscribing is a hard delete of the row,
  not a status flag — there's no reason to retain a withdrawn subscriber's
  email at all. Disclosed on `/datenschutz` now, not after the feature ships.
- **`ingest_runs`** — one row per ingest run: items fetched/classified,
  prompt/completion tokens, estimated cost, and whether the run hit its hard
  item cap. Exists so token spend is a number someone can look at, not a
  surprise on the invoice.

### Expected cost, before any cron is switched on

Classification should use **Claude Haiku 4.5** ($1/MTok input, $5/MTok
output as of this writing — verified against Anthropic's current pricing
page, not memory) — this is straightforward structured-output classification,
not a task that needs a larger model. Estimating generously (no prompt
caching, ~1,500 input tokens and ~200 output tokens per item — system prompt,
category rules, and the item's feed content in, headline/summary/action and
metadata out):

- Cost per item ≈ **$0.0025**
- At 10–30 new items/day combined across offenbach.de and of-news.de (your
  estimate): **300–900 items/month → roughly $0.75–$2.25/month**
- Even a hard cap of, say, 50 items per run hit on every single run for a
  month caps the ceiling at **~$3.75/month**

Small either way, but the `ingest_runs` log means that's a checked fact after
the first month, not an assumption. Prompt caching (the system prompt and
category rules repeat across every item in a run) would push it lower still.

### Environment

Neon project must be created in the **EU (Frankfurt / eu-central-1) region.**
This isn't a code-level setting — it's a choice made once, in the Neon
console, when the project is created — but getting it wrong means personal
data (digest subscriber emails, and potentially names that appear in
classified item text) leaves the EU, which makes the Datenschutz page
inaccurate. `lib/db/index.ts` has the same note next to the connection code.

## Email and forms

`/mitglied-werden` (and later `/kontakt`) send mail via [Resend](https://resend.com) —
no database. Persistence arrives in Step 4 once the Neon schema exists; until
then, a submission either becomes an email or it didn't happen.

Anti-spam is a honeypot field (`website`, invisible to real visitors, `aria-hidden`)
plus a minimum 4-second gap between when the form loaded and when it was
submitted (`MIN_SUBMIT_MS` in `lib/forms.ts`). Both fail "successfully" — the
submitter gets a normal-looking success response either way, so there's nothing
for a bot to learn from a rejection. No Upstash, no third-party rate-limiting
service: one more account for a volunteer board to maintain would cost more
than the spam it'd prevent.

### Environment variables

```
RESEND_API_KEY=        # required to actually send mail
RESEND_FROM_EMAIL=     # optional, defaults to "Treffpunkt Offenbach <onboarding@resend.dev>"
RESEND_TO_EMAIL=       # optional, defaults to VEREIN.email (info@treffpunkt-offenbach.com)
NEXT_PUBLIC_SITE_URL=

# Needed starting with OF-Radar (step 4), not yet:
DATABASE_URL=          # Neon
ANTHROPIC_API_KEY=     # news classification
CRON_SECRET=           # protects /api/radar/ingest
ADMIN_PASSWORD=        # /admin/radar login
```

Without `RESEND_API_KEY` set, form submissions fail with a clear (and safe —
no internal details leaked) message asking people to email or call directly
instead; the real error is logged server-side only.

### Making mail actually deliver: DNS records

Resend refuses to send as a domain it hasn't verified, and until it's
verified, mail can only go **from** `onboarding@resend.dev` **to** the email
address on the Resend account itself — fine for development, useless for a
live contact form. To verify `treffpunkt-offenbach.com` (or whichever domain
ends up canonical):

1. Add the domain in the Resend dashboard → Domains.
2. Resend generates the SPF and DKIM records **for that specific domain** —
   copy them from the dashboard's **Records** tab and add them at the
   registrar exactly as shown. These values are generated per domain and
   change if the domain is re-added, so there's no fixed value to hand you
   here; anything printed in advance would risk being wrong. (Resend has also
   said domains added after August 2026 may get CNAME records instead of the
   older TXT/MX pattern — another reason to always copy from the dashboard,
   not from anything written down beforehand.)
3. Add a DMARC record yourself — this one *is* a fixed, standard format, not
   Resend-specific:

   ```
   Host: _dmarc.treffpunkt-offenbach.com
   Type: TXT
   Value: v=DMARC1; p=none; rua=mailto:info@treffpunkt-offenbach.com;
   ```

   Start with `p=none` (monitoring only, nothing gets rejected) and tighten to
   `p=quarantine` and eventually `p=reject` once you've confirmed all
   legitimate mail sources pass. Resend's own guide: https://resend.com/docs/dashboard/domains/dmarc
4. Verification in the Resend dashboard can take a few minutes to a few hours
   after the records propagate.
5. Once verified, set `RESEND_FROM_EMAIL` to a real address at the domain
   (e.g. `"Treffpunkt Offenbach <mitglied-werden@treffpunkt-offenbach.com>"`).

## Visual verification

```bash
npx playwright install chromium --with-deps   # once
npx playwright test                           # runs tests/visual.spec.ts
```

Screenshots land in `test-results/visual/` (gitignored) — every route, both
themes, 1360px and 420px, and the run fails on any console error. Read the
PNGs afterwards; a passing run only proves nothing crashed, not that the
layout looks right.

One thing worth knowing if you add new full-page screenshots elsewhere:
`components/motion.tsx`'s `Reveal` fades sections in via `IntersectionObserver`
as the real viewport scrolls past them. A `fullPage` screenshot taken without
actually scrolling through the page first captures sections that never
entered the viewport — they show up blank, which looks like a bug but isn't
one. `visual.spec.ts` scrolls through the page before capturing for exactly
this reason; copy that pattern rather than dropping it.

## From the board, still needed

- The real member list and consent to publish it (see "Member data" above);
- The real event calendar — dates for the next Offenbacher Woche, Lichterfest,
  verkaufsoffene Sonntage, and the Weihnachtsbeleuchtung period (see "Events
  and dates" above);
- Vereinsregister number and founding year, for the Impressum and `/verein`;
- Membership fee amounts, for the open fee table on `/mitglied-werden`;
- How long submitted form data should be kept — the consent text on both
  forms has a `TODO-COPY` placeholder for this, and so does Datenschutz;
- Confirmation that AVVs (data processing agreements) are in place with
  Vercel, Resend, and Neon, and which Art. 44 DSGVO transfer basis applies to
  each — all three are US companies (even though Neon's database itself will
  live in the EU/Frankfurt region) — all flagged `TODO-COPY` on `/datenschutz`;
- Satzung and a fuller Vereinsgeschichte for `/verein`, if the board wants
  more there than the current Vorstand list;
- Proofreading of the German copy — it's written as working drafts;
- The old PDF membership application, if the board wants it kept as a
  download alternative to the form (we don't have a copy of it).
