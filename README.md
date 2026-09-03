# treffpunkt-offenbach

Website for Gewerbeverein Treffpunkt Offenbach e. V. Next.js 16 (App Router),
TypeScript, Tailwind v4, motion, lenis. Deploys to Vercel, region fra1.

**v1 is a fully static site — zero external services.** No database, no
email service, no AI API, no login screen. Every route needs nothing but the
files in this repo; the only environment variable v1 uses at all is
`NEXT_PUBLIC_SITE_URL`. That was a deliberate scope cut for the first
deploy, not the original plan — see "v2, parked" below for what was built
and set aside, and why.

## Running locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build, must pass with zero errors
```

## What's built

- Design system in tokens: `app/globals.css`, three themes (system / light / dark).
  Worth knowing for anyone presenting this to the board: the blue/white/navy
  palette isn't a new direction — the association's own existing logo is
  blue, so this is continuity with their identity, not a departure from it;

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
  OpenStreetMap. **Currently shows an honest "Verzeichnis im Aufbau" state** —
  see "Member data" below.
- **`/mitglied-werden`** — benefits, an open (currently TODO-COPY) fee table,
  and a contact block: mailto, phone. No form — see "v2, parked" below.
- **`/veranstaltungen`** and `/veranstaltungen/[slug]` — event pages with Event
  JSON-LD and an Europe/Berlin-correct `.ics` download, both gated on the event
  actually having a confirmed date — see "Events and dates" below.
- **`/verein`** — the real Vorstand from `data/verein.ts`, with roles. No founding
  year or Satzung yet; the page says so rather than guessing or leaving a gap.
- **`/kontakt`** — address, phone, mailto, and the one map the site renders
  locally: the association's own address, fetched by `scripts/fetch-verein-map.mjs`.
- **`/radar`** and **`/radar/[slug]`** — file-based, no database. Reads
  `data/radar.json` at build time; category filter chips, a "Für mich
  relevant" local-only sort, a 12-week frequenz timeline, deadline
  countdowns with `.ics` downloads, and an RSS feed at `/radar/feed.xml`.
  Shows an honest empty state while the file holds only specimens — see
  "OF-Radar" below.
- 301 redirects from the old `.php` URLs in `next.config.ts`;
- `tests/visual.spec.ts` (Playwright) — screenshots every route in both themes
  at 1360px and 420px and fails on any console error. See "Visual verification"
  below.

### What's left

1. Deploy (in progress — see the PR/commit history around the deploy).
2. OG images via `next/og`.
3. v2: the real member list, the real event calendar, OF-Radar's database
   and classifier — see "v2, parked" below.

## v2, parked

A database-backed OF-Radar (Postgres/Neon + Drizzle, an Anthropic-classified
ingest pipeline, a Basic-Auth editorial admin at `/admin/radar`) and a
Resend-backed contact/membership form were built and working before v1's
scope was deliberately cut to "no external services" for the first deploy.
**Nothing was deleted.** It's all still in the repo:

- `lib/db/`, `drizzle/`, `drizzle.config.ts` — the Postgres schema, untouched;
- `lib/mail.ts`, `lib/forms.ts`, `components/ContactForm.tsx` — the Resend
  wrapper and form validation, untouched;
- `_v2-parked/` — the admin route, its components, its query/validation
  layer, and both Resend-backed API routes, moved here (not deleted) because
  they cross-reference each other and `tsconfig.json` now excludes this
  directory from type-checking. `_v2-parked/README.md` has the exact restore
  path for every file.
- `proxy.ts` stays at the project root with its real Basic-Auth logic intact,
  but its matcher is deliberately pointed at a path nothing can request —
  see the comment in that file for why (short version: with `/admin/radar`
  gone, the live matcher would make `/admin` answer 503 instead of 404).

None of this is reachable from the v1 build. Verified two ways after cutting
it: grepped the build output and the compiled `.next` bundles for
`DATABASE_URL`, `RESEND_API_KEY`, `ANTHROPIC_API_KEY`, and `ADMIN_PASSWORD` —
clean, except `ADMIN_PASSWORD` inside `proxy.ts`'s own bundled (but inert)
code.

Also parked, from before the scope cut: a full source audit of OF-Radar
candidate feeds (offenbach.de and of-news.de work; op-online.de and
hessenschau.de were deliberately excluded; several others have no feed at
all), a manual-vs-automated design for the two highest-liability categories,
and a computed cost estimate for the classifier (~$1–3/month at Haiku 4.5
rates). All of that reasoning is preserved in the git history — see the
commits titled around "step 4a" through "step 4c" — and applies unchanged
whenever v2 happens.

## Member data

`data/members.json` currently holds 12 **placeholder** businesses — plausible
generic names, not real companies — flagged with a `_note` field containing
`TODO-COPY`. As long as that marker is present, `MEMBERS_ARE_PLACEHOLDER` in
`lib/members.ts` is `true` and the site refuses to show the placeholder data as
if it were real: `/mitglieder` shows an "under construction" message,
`/mitglieder/[slug]` pages don't exist (`generateStaticParams` returns `[]`,
`dynamicParams` is `false`), and the homepage marquee doesn't render.

**The old site (`treffpunkt-of.de`) has no member list to migrate from.**
Checked directly — five pages total (Startseite, Aktuell, Formulare, Vorstand,
Impressum), none of them lists member businesses individually. The homepage
does say, in its own words, that membership is broad ("In Offenbach sind alle
relevanten Kaufhäuser und Gastronomen Mitglieder des Treffpunkt Offenbach" —
see `/mitglied-werden` and the homepage, which now quote this directly), but
that's a general claim, not a roster. The real list has to come from the
board via the CSV template below — there is nothing to extract from the old
site.

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

## Animation

One system, applied consistently, all in `components/motion.tsx` plus a
handful of CSS classes in `app/globals.css`:

- Hero headline: `LineReveal` masks each line in via `translateY` (never
  `opacity`, so the h1 stays LCP-eligible from first paint), starting the
  instant `.logo-draw`'s ring finishes (`HERO_TEXT_DELAY` in
  `app/(site)/page.tsx` mirrors the 0.85s in globals.css by comment, not
  by shared constant — if the ring's duration changes, update both).
  Lead/buttons follow 150ms later via `MountReveal`.
- `Header.tsx`'s active nav link gets a `layoutId`-based indicator that
  slides between links on route change (Framer Motion shared layout).
- Kennzahlen: `CountUp` now draws a thin accent rule under the number in
  the same window it counts in — one `ref`/`inView` pair drives both, so
  they can't drift apart.
- `Card` gets a `.card-surface` hover treatment (border → accent, 1px
  lift, no shadow/scale) via a CSS custom property, since the border
  colour is also set per-instance (the `accent` prop) and a `:hover` rule
  can't win against an inline `style.borderColor`.
- The outline `Button` variant gets a growing 2px underline (`.btn-underline`,
  same idea as `.link-underline` but without its text-specific padding).
- Section headings reveal one beat (100ms) before the body content below
  them, site-wide on the homepage.
- `ScrollProgress` is a fixed 2px accent line at the top of the viewport,
  bound directly to `useScroll()` — no spring, so it never moves except
  in response to actual scrolling. The one ambient effect in the system.

Everything above respects `prefers-reduced-motion` (component-level via
`useReducedMotion`, plus the blanket `@media (prefers-reduced-motion: reduce)`
block in globals.css for CSS transitions) and keeps the `data-reveal` +
`<noscript>` fallback pattern already documented inline in
`app/(site)/layout.tsx`.

**Deliberately not done:**

- **View Transitions API.** Next's own docs describe wrapping route
  content in React's `<ViewTransition>`, but that component needs a
  React canary build — the installed `react`/`react-dom` here are the
  stable 19.2.8 and don't export it. Bumping to canary on a site about to
  go to production is a real decision, not a drive-by add; parked until
  that's worth doing on purpose.
  (The radar list's per-item stagger and chip fade-in, also originally
  listed here as deferred, landed as part of the OF-Radar rebuild below
  instead of being written twice against a page that was about to change.)

## Hero background

The homepage hero and the inverted CTA strip have no photography — the site
has no rights to any photo of Offenbach, and a Verein site running an
unlicensed city photo is a real risk, not a theoretical one. Instead
`components/BrandBackdrop.tsx` draws a soft token-based gradient plus a giant,
very faint OF-Siegel bleeding off the frame, built from the same path data as
the real logo (`MARK_PRIMARY_PATHS` in `components/Logo.tsx`) so it can never
drift from the mark. Flat CSS only, `aria-hidden`, no layout impact.

**If the association supplies their own photo** (Offenbacher Woche,
Lichterfest, or similar), drop it at `public/hero/innenstadt.jpg` and rebuild
— `lib/hero-image.ts` picks it up automatically and the hero switches to a
`next/image` with a dark overlay for text contrast. No code change needed.
Nothing currently exists at that path.

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

File-based, no database (the earlier Neon/cron/admin design stays parked,
see "v2, parked" above — this isn't a stepping stone toward it, it's a
deliberately different, simpler approach: a local script proposes items,
a human writes two sentences, a commit publishes them). `data/radar.json`
holds the same field shape the parked Drizzle schema used (`category`,
`headline`, `summary`, `action`, `sourceName`, `sourceUrl`, `date`,
`urgency`, optional `deadline`, `origin` always `"manual"`), read at build
time by `lib/radar-content.ts`.

`RADAR_ITEMS_ARE_PLACEHOLDER` (in `lib/radar-content.ts`, same pattern as the
member-list guard) is `true` while `data/radar.json`'s `_note` field still
says `TODO-COPY`. While true, the business list (see below), `/radar/[slug]`,
`/radar/feed.xml`, and the homepage teaser's business items all show an
honest empty state instead of rendering specimen content.

### A hybrid module, two different intake standards

The page is not one list with one bar for entry — it's two, and they stay
visually and editorially separate:

- **Calendar (`frequenz`)** — low bar, high volume. Anything that puts
  people on the street where members' shops are qualifies: markets,
  festivals, guided tours, verkaufsoffene Sonntage, Weihnachtsmarkt, OFC
  home games, Messen. The test is just "does this bring foot traffic to
  the Innenstadt" — an event in another district or another town doesn't
  qualify, no matter how big.
- **Business list (`rathaus`, `baustelle`, `foerderung`, `stadt`,
  `recht`)** — strict. The test stays "does this change something for a
  business owner." A handful of items a month is the expected volume, not
  a shortfall to fix — a short honest list beats a padded one.

`lib/calendar.ts` merges the calendar half with the association's own
confirmed events (`data/content.ts`, `hasConfirmedDate` — the same guard
`/veranstaltungen` uses) into one 12-week timeline, independent of
`RADAR_ITEMS_ARE_PLACEHOLDER`: the association's real events don't stop
being real just because no radar item has been published yet, and that
calendar is the one part of this module reliable enough to lead the page
with. `/radar` and the homepage teaser both lead with it, then "und was
sonst Ihr Geschäft betrifft" for the business list.

One consequence worth knowing: `/radar` reads `searchParams` for its
category filter (`/radar?kategorie=rathaus` needs to be a real,
shareable, indexable URL — a static file can't serve different content
per query string), so that one route builds as dynamic (`ƒ`) rather than
static, unlike the rest of the site. Still zero external services — no
database, no API call — just server-rendered per request instead of
served as a static file.

### What's on the page

- **The list.** Dense, one item per entry: date, category chip, headline,
  a plain-language summary, a tinted "Was das für Sie heißt" box (the one
  sentence telling a business owner what to actually do), and a source
  link with its own date. An item with `urgency: "high"` gets a left rule
  in the site's one warm colour — reserved for exactly this.
- **Category filter chips.** The five business rubrics plus "Alle", as real
  links — `/radar?kategorie=baustelle` is a page you can bookmark or send
  someone, not just a UI state that resets on reload. `frequenz` isn't a
  filter chip here; it lives in the calendar instead (see above).
- **"Für mich relevant."** A visitor can save their Branche and Straße —
  stored only in their own browser (`localStorage`), never sent to us —
  and the list re-sorts around it: matches float up, the rest dims but
  never disappears. See `lib/radar-relevance.ts` for exactly how an item
  is scored; it's a plain-text heuristic (does the item mention their
  street, does the category usually matter to their Branche), not a claim
  of precision.
- **Deadlines.** An item with a `deadline` shows "noch N Tage", turning
  the signal colour under two weeks out, plus a one-click `.ics` download
  for the deadline date itself. The count is computed in the visitor's
  own browser on page load — this page is prerendered at build time, so a
  server-computed count would freeze at whatever it was on deploy day and
  read wrong a week later.
- **The Innenstadt calendar.** Every `frequenz`-category item and every
  confirmed association event due in the next 12 weeks gets a marker on a
  horizontal timeline pinned above the business list — one view for "what's
  coming up", not two half-overlapping ones.
- **`/radar/feed.xml`.** A plain RSS 2.0 feed, built from the same file,
  for anyone who'd rather subscribe than check back.

### Publishing a real item (no coding required)

1. Open `data/radar.json` in any text editor.
2. Copy one of the existing entries inside `"items"` as a starting point
   — everything between one `{` and its matching `}`.
3. Fill in, in plain German:
   - `category` — exactly one of: `rathaus`, `baustelle`, `foerderung`,
     `frequenz`, `stadt`, `recht` (see the labels in
     `lib/radar-content.ts` if you're unsure which fits).
   - `headline` — short, specific, no clickbait.
   - `summary` — two or three sentences of plain explanation.
   - `action` — one sentence: what should a business actually *do* with
     this? This is what shows in the blue "Was das für Sie heißt" box.
   - `sourceName` and `sourceUrl` — where this came from, and a link to
     it. Never publish something without a real source to point to.
   - `date` — the day you're publishing it, as `YYYY-MM-DD`.
   - `urgency` — `"low"`, `"mid"`, or `"high"`. Only use `"high"` for
     something genuinely time-critical; it's the one item on the page
     that gets a colour flag.
   - `deadline` — a `YYYY-MM-DD` date if there's a real deadline attached
     (a form due date, an application window closing), otherwise `null`.
   - `slug` — a short, URL-safe, unique id (lowercase, hyphens, no
     spaces) — this becomes the item's own address at `/radar/<slug>`.
   - `origin` — leave as `"manual"`.
4. Once **every** entry in the file is real (no more `BEISPIELQUELLE
   (Testdaten)` placeholders left), delete the `_note` field at the very
   top of the file — that's the switch that takes the whole page live.
   Leaving it in place on purpose is fine while you're still filling in
   real items; the page just keeps showing its "coming soon" message
   until the note is gone.
5. Save, commit, and redeploy. That's the entire publishing step — no
   database, no admin panel, no build script to run first.

This exists because an earlier seed array briefly rendered fabricated
headlines on the homepage attributed to real institutions (Stadt
Offenbach, WIBank, IHK Offenbach am Main) that never published any of it —
see the git history for the fix. The guard above (`_note` /
`RADAR_ITEMS_ARE_PLACEHOLDER`) is what makes that class of mistake
structurally harder to repeat: the page simply won't show item content
while the note says it's still specimens.

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

### Lighthouse

Not part of the automated suite — run manually against a production build
when it's worth checking:

```bash
npm run build && npm start   # in one terminal
npx lighthouse http://localhost:3000/ --preset=desktop \
  --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags="--headless"
```

Needs a real Chrome/Chromium; set `CHROME_PATH` if `lighthouse` can't find
one on its own. Last run against the production build: **100 / 100 / 100 /
100** (performance / accessibility / best practices / SEO).

## From the board, still needed

- The real member list and consent to publish it (see "Member data" above);
- The real event calendar — dates for the next Offenbacher Woche, Lichterfest,
  verkaufsoffene Sonntage, and the Weihnachtsbeleuchtung period (see "Events
  and dates" above);
- Real OF-Radar items to replace the specimens in `data/radar.json`;
- Vereinsregister number and founding year, for the Impressum and `/verein`;
- Membership fee amounts, for the open fee table on `/mitglied-werden`;
- Confirmation that an AVV (data processing agreement) is in place with
  Vercel, and which Art. 44 DSGVO transfer basis applies — flagged
  `TODO-COPY` on `/datenschutz`;
- Retention period for Vercel's access logs — also `TODO-COPY` on
  `/datenschutz`;
- Satzung and a fuller Vereinsgeschichte for `/verein`, if the board wants
  more there than the current Vorstand list;
- Proofreading of the German copy — it's written as working drafts;
- The old PDF membership application, if the board wants it linked on
  `/mitglied-werden` as a download — we don't have a copy of it.
