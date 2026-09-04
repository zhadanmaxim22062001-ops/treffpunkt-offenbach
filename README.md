# treffpunkt-offenbach

Website for Gewerbeverein Treffpunkt Offenbach e. V. Next.js 16 (App Router),
TypeScript, Tailwind v4, motion, lenis. Deploys to Vercel, region fra1.

**v1 is almost entirely static — zero external services — with one
deliberate exception: `/kontakt`'s contact form sends real email.** It does
that through the association's own existing mailbox (SMTP, via nodemailer),
not a third-party email API — see "Kontaktformular" below for exactly why
that's the DSGVO-preferred option and how it's wired up. No database, no AI
API, no login screen, and still no third-party *service* in the "adds a new
processor" sense. Environment variables: `NEXT_PUBLIC_SITE_URL` (used
throughout) plus `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` /
`MAIL_TO` (used only by `/api/kontakt`, see "Kontaktformular"). That's a
deliberate, narrow exception to the original "no external services" scope
cut for the first deploy, not a reversal of it — see "v2, parked" below for
everything that's still cut and why. The one piece of automation in the
whole project is a GitHub Actions workflow that proposes OF-Radar calendar
entries via a pull request (see "OF-Radar" below) — it needs no secret
beyond the built-in `GITHUB_TOKEN` and never touches the business list.

## Running locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build, must pass with zero errors
```

## Deploying

The repo lives at `github.com/<owner>/treffpunkt-offenbach` and is
connected to a Vercel project of the same name — **a push to `master`
deploys automatically**, same as any other Vercel Git integration. Merging
a pull request (including the OF-Radar bot's) is a deploy. There's no CLI
step in the normal loop: edit, commit, push (or merge), done.

The `npx vercel --prod --token …` flow from before the repo existed still
works — `.env.deploy` still holds a token for it — but it's a fallback for
a one-off manual deploy, not the routine path anymore. A first-time push
from a GitHub identity Vercel hasn't seen before on this team can land in
a `BLOCKED` state pending a one-click approval in the Vercel dashboard
(`vercel.com/<team>/<project>/<deployment-id>`) — a one-time thing per
identity, not a recurring issue.

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
- **`/kontakt`** — a real contact form that sends real email (see
  "Kontaktformular" below), address/phone direct underneath it, and the one
  map the site renders locally: the association's own address, fetched by
  `scripts/fetch-verein-map.mjs`.
- **`/radar`** and **`/radar/[slug]`** — file-based, no database. Reads
  `data/radar.json`; a 12-week Innenstadt calendar (association events +
  `frequenz` items) leads the page, a strict, hand-written business list
  with category filter chips and a "Für mich relevant" local-only sort
  follows, deadline countdowns get `.ics` downloads, and there's an RSS
  feed at `/radar/feed.xml`. Items age out of lists on a relevance window
  (30 days by default, with exceptions) but their own pages never break —
  see "OF-Radar" below for the full intake and visibility design.
- 301 redirects from the old `.php` URLs in `next.config.ts`;
- `tests/visual.spec.ts` (Playwright) — screenshots every route in both themes
  at 1360/900/420/360px and fails on any console error or warning, plus checks
  for horizontal overflow and images missing explicit dimensions. See "Visual
  verification" below.

### What's left

1. Deploy (in progress — see the PR/commit history around the deploy).
2. OG images via `next/og`.
3. v2: the real member list, the real event calendar, OF-Radar's database
   and classifier — see "v2, parked" below.

## v2, parked

A database-backed OF-Radar (Postgres/Neon + Drizzle, an Anthropic-classified
ingest pipeline, a Basic-Auth editorial admin at `/admin/radar`) was built
and working before v1's scope was deliberately cut to "no external
services" for the first deploy. **Nothing was deleted.** It's all still in
the repo:

- `lib/db/`, `drizzle/`, `drizzle.config.ts` — the Postgres schema, untouched;
- `_v2-parked/` — the admin route, its components, its query/validation
  layer, and the still-parked `/api/mitglied-werden` route, moved here (not
  deleted) because they cross-reference each other and `tsconfig.json` now
  excludes this directory from type-checking. `_v2-parked/README.md` has
  the exact restore path for every file.
- `proxy.ts` stays at the project root with its real Basic-Auth logic intact,
  but its matcher is deliberately pointed at a path nothing can request —
  see the comment in that file for why (short version: with `/admin/radar`
  gone, the live matcher would make `/admin` answer 503 instead of 404).

None of this is reachable from the v1 build. Verified two ways after cutting
it: grepped the build output and the compiled `.next` bundles for
`DATABASE_URL`, `ANTHROPIC_API_KEY`, and `ADMIN_PASSWORD` — clean, except
`ADMIN_PASSWORD` inside `proxy.ts`'s own bundled (but inert) code.

Also parked, from before the scope cut: a full source audit of OF-Radar
candidate feeds (offenbach.de and of-news.de work; op-online.de and
hessenschau.de were deliberately excluded; several others have no feed at
all), a manual-vs-automated design for the two highest-liability categories,
and a computed cost estimate for the classifier (~$1–3/month at Haiku 4.5
rates). All of that reasoning is preserved in the git history — see the
commits titled around "step 4a" through "step 4c" — and applies unchanged
whenever v2 happens.

**The contact form itself is no longer part of this list.** It was
originally built Resend-backed, cut along with everything else above, and
then un-parked and rebuilt directly into v1 — SMTP instead of Resend, so it
doesn't add a new processor. See "Kontaktformular" below for how it works;
`resend` and `RESEND_API_KEY` are gone from the repo entirely. What's still
parked is only the *membership* form on `/mitglied-werden`, which needs the
same `ContactForm` component wired up with its `betrieb`/`branche`/`adresse`
fields — a smaller job than it was before, now that the SMTP plumbing
already exists and works.

## Kontaktformular

`/kontakt`'s form sends real email through the association's own existing
mailbox — `info@treffpunkt-offenbach.com`, hosted at IONOS — rather than
through a transactional-email service like Resend or a third-party form
backend (Formspree, Web3Forms, Getform, …). That's the DSGVO-preferred
choice here: routing mail through the mailbox the association already has a
relationship with introduces no new processor and needs no new
Auftragsverarbeitungsvertrag, unlike handing form submissions to a service
the association has never contracted with.

**Environment variables** (Vercel, not committed): `SMTP_HOST`, `SMTP_PORT`,
`SMTP_USER`, `SMTP_PASS`, `MAIL_TO`. `SMTP_HOST` (`smtp.ionos.de`) and
`SMTP_PORT` (`465`) were determined from the domain's own public DNS — its
MX records point at `mx00`/`mx01.ionos.de`, and its SPF record reads
`v=spf1 include:_spf-eu.ionos.com ~all`, both consistent with IONOS's
standard mail hosting, whose documented submission host for every mailbox
they host is `smtp.ionos.de:465`. `SMTP_USER`/`SMTP_PASS` are the real
mailbox credentials and `MAIL_TO` is where mail should land if that's ever
a different address than the sending mailbox — none of the three can be
determined from outside and must be set by whoever holds those credentials.

**How a submission is handled**, in `app/api/kontakt/route.ts`:

1. Validated server-side with zod (`lib/forms.ts`'s `contactSchema`) — name,
   email, optional phone, optional company, a message (10–3000 characters),
   and a required (never pre-checked) consent checkbox. Client-side
   validation in `components/ContactForm.tsx` is only ever a head start on
   the same rules, never the actual gate.
2. Checked for spam, entirely server-side, with no CAPTCHA (a CAPTCHA needs
   a third party and — for reCAPTCHA/hCaptcha — the cookie banner this site
   is deliberately built to avoid): a CSS-hidden honeypot field a real
   visitor never reaches, and a minimum 3-second gap between when the page
   rendered and when the form was submitted (`lib/forms.ts`'s
   `looksLikeSpam`). Either one fails "successfully" — a normal-looking
   success response, so a bot learns nothing from retrying.
3. Rate-limited in-memory (`lib/rate-limit.ts`) at 5 submissions per IP per
   10 minutes. Deliberately not Redis-backed — it's scoped to a single warm
   serverless instance, which is the honest limit of "simple" here, not a
   defense against a distributed sender.
4. Sent via `lib/mail.ts` (nodemailer): `From` is always the association's
   own authenticated mailbox (a visitor's address in `From` fails SPF/DKIM
   at the receiving end and lands in spam), `Reply-To` is the visitor's
   address so the board can just hit reply, `Subject` is "Kontaktanfrage
   über treffpunkt-offenbach.com — {name}".
5. Nothing is persisted anywhere in this flow — no database write — and the
   error path deliberately never logs the message body or the sender's
   address, only enough to see in the Vercel function logs that a send
   failed and roughly why.

**Works without JavaScript, as far as it reasonably can.** The `<form>`
always carries a real `action="/api/kontakt" method="post"`, and the
honeypot/timing fields are real form fields rather than ones JavaScript
injects at submit time, so a browser with JS disabled still does a normal,
working POST. The route handler tells the two cases apart by request
`Content-Type` (`application/json` from `ContactForm`'s fetch call vs.
`application/x-www-form-urlencoded` from a native submit) and responds
accordingly — JSON back to `ContactForm`, or a 303 redirect to
`/kontakt?gesendet=1` / `/kontakt?fehler=1` for the no-JS case, which
`/kontakt`'s own server component reads and renders as a real, server-
rendered confirmation or error state. The one real trade-off: that redirect
carries only a status flag, never the submitted values (putting a
visitor's name/email/message into a URL would land them in Vercel's own
request logs, which is exactly what the "no log line with the message
body" guarantee above is for) — so a no-JS visitor whose submission fails
validation has to retype it. A JS-enabled visitor doesn't hit this at all;
`ContactForm` keeps what they typed in place and shows the real per-field
errors instead.

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

The homepage hero now renders a real photo of Offenbach
(`public/hero/offenbach-innenstadt.jpg`, a Wikimedia Commons aerial), full-bleed
via `next/image`, with a navy scrim (left-to-right, strongest under the
headline) so the text stays readable and the brand mark draws on over the
skyline. The inverted CTA strip still has no photography and uses the flat
gradient below.

**The photo only renders when it's fully credited.** `data/media.ts` defines
`HERO_PHOTO_CREDIT` (author, licence name + URL, source file-page URL, and a
required note on what was changed) and an `isMediaCreditComplete()` guard;
`lib/hero-image.ts` returns the image path only when every field is filled in
*and* the file exists on disk. If either is missing, the hero silently falls
back to `components/BrandBackdrop.tsx` — the same soft token-based gradient
plus giant, very faint OF-Siegel (built from `MARK_PRIMARY_PATHS`) it always
used. Same guard pattern as `MEMBERS_ARE_PLACEHOLDER` /
`RADAR_ITEMS_ARE_PLACEHOLDER`: a copyrighted image can't ship uncredited by
accident, on purpose or otherwise.

A small credit line renders beneath the hero (author, licence linked to the
deed, a link to the file page), and every image on the site is listed in full
under "Bildnachweise" on `/impressum` — including the `/kontakt` map's
OpenStreetMap attribution, which `components/StaticMap.tsx`'s colour
filtering deliberately leaves untouched and legible.

**Licensing scope — read this before touching the hero photo again.** The
current photo is CC BY-SA 4.0 (Adrianflamind, via Wikimedia Commons), and it
was cropped/recompressed for this site, which is a "change" the licence
requires disclosing (done — see the credit line and Bildnachweise entry).
**ShareAlike attaches to the adapted image file, not to the website.** Our
resized, recompressed copy of that photo is itself available under
CC BY-SA 4.0 to anyone who takes it from here — but the site's own code and
text are a separate work and are not put under CC BY-SA by sitting next to
it. Don't let "ShareAlike" get read as "the whole repo is now CC BY-SA
licensed"; it isn't, and nothing here changes that. If a future photo swap
uses a differently-licensed image, update this note to match that licence's
actual terms rather than copying this paragraph forward unchanged.

**Swapping the photo:** replace the file, update every field in
`HERO_PHOTO_CREDIT` in `data/media.ts` to match the new image's real licence
and source, and rebuild. Leaving any field blank (or leaving the old data
pointing at a file that no longer exists) drops the hero back to the
geometric fallback automatically — that's the safe failure mode, not a bug.

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
deliberately different, simpler approach). Two intake paths feed one file,
`data/radar.json`, which holds the same field shape the parked Drizzle
schema used (`category`, `headline`, `summary`, optional `action`,
`sourceName`, `sourceUrl`, `date`, `urgency`, optional `deadline`, optional
`place`, `origin` — `"manual"` or `"auto"`), read at build time by
`lib/radar-content.ts`. Git is the editorial gate for both paths: nothing
reaches the site without a commit, and nothing reaches `master` without
either a human running a script locally or a human merging a pull request.

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

### Two intake paths — one strict, one automatic

**Local, for the business list (`npm run radar:fetch`).** Runs on your own
machine, never in CI. Fetches both sources (see "Sources" below), applies
the Offenbach filter, dedupes against `data/radar.seen.json`, and writes
unclassified proposals to `data/radar.inbox.json` — headline, source,
date, link, nothing else. You write the German (`category`, `headlineDe`,
`summaryDe`, `actionDe`, `urgency`, optional `deadline`) directly into that
file, by hand, for whichever proposals are actually worth publishing. Then:

```bash
npm run radar:fetch              # writes/updates data/radar.inbox.json
# ...edit data/radar.inbox.json, fill in the German fields for one item...
npm run radar:promote -- <id>    # moves it into data/radar.json, strips inbox-only fields
```

`radar:promote` refuses to publish anything missing `sourceName`,
`sourceUrl`, a valid `date`, a real `category`/`urgency`, or any of the
three German fields — there's no way to accidentally publish a stub.
Editing `data/radar.json` directly, with no script at all, works exactly
as well; the scripts are a convenience, not a gate.

**Automatic, for the calendar only (GitHub Actions, `.github/workflows/radar-auto-calendar.yml`).**
Runs daily (and on demand — see below), and can *only* ever produce
`frequenz` calendar entries. It cannot write a business-list item; the
script it runs (`scripts/radar-auto-calendar.mjs`) doesn't even attempt to
classify one. An item is auto-published only when its own title states all
three of: an event word (Markt, Fest, Führung, Wanderung, …) with no
cancellation/notice word alongside it, an explicit "am DD. Monat" date, and
a recognized Innenstadt place name — no interpretation, no inference. Every
auto-published item is stamped `origin: "auto"` and gets a small
"Automatisch aus der Quelle übernommen" note on its own page. Anything that
looked event-ish but was missing a date or a recognizable place lands as a
link under "Zur Prüfung" in the pull request instead — genuinely mundane
items (office closures, drills, meetings) are silently dropped, not listed,
so the review section stays short instead of recreating the classifier's
noise problem in a different shape.

The workflow **never pushes to `master`.** It force-pushes a single
`radar/auto-calendar` branch and opens or updates one pull request titled
**"OF-Radar: neue Termine"**. Merging that PR is the entire publishing
step — Vercel deploys on merge, same as any other commit. No secret beyond
the built-in `GITHUB_TOKEN` is used; the workflow only reads two public
feeds and writes to the repo it already runs in.

**Running it by hand:** GitHub → **Actions** tab → **OF-Radar Kalender** →
**Run workflow**. Same as `gh workflow run "OF-Radar Kalender"` from the
CLI. Useful for testing changes to the script, or just checking early.

**Sources**, kept in `scripts/lib/radar-sources.mjs` and shared by both
paths — offenbach.de's own Meldungen feed (official, unfiltered — see the
comment there for why) and OF-News.de (regional, so it gets the real
Offenbach-term filter). hessenschau.de and op-online.de are deliberately
excluded, with the reasons recorded right there so nobody re-adds them
without re-reading why.

### Staying relevant — and stopping being relevant

Nothing sits on `/radar` forever just because it was published once.
`isRadarItemVisible` (`lib/radar-content.ts`) decides, checked fresh
against the actual request date every time (never baked into a static
build — see the note on `/radar` being dynamic above; the homepage and
`/radar/feed.xml` are static but revalidate hourly for the same reason):

1. `pinned: true` always wins — for something like a delayed committee
   session that stays relevant on its own timeline, not a generic one.
2. `frequenz` items stay in the calendar through their own event date,
   then drop off — a market that already happened isn't upcoming.
3. An item with a `deadline` stays visible until that deadline passes,
   however old it otherwise looks.
4. Everything else: 30 days from `date`.

This only ever governs whether an item shows up in a list or the
calendar. An item's own `/radar/<slug>` page keeps resolving forever
regardless — a link someone bookmarked or shared never 404s just because
the item aged out of the list.

### What's on the page

- **The list.** Dense, one item per entry: date, category chip, headline,
  a plain-language summary, a tinted "Was das für Sie heißt" box (the one
  sentence telling a business owner what to actually do), and a source
  link with its own date. An item with `urgency: "high"` gets a left rule
  in the site's one warm colour — reserved for exactly this. The "Was das
  für Sie heißt" box only appears when `action` is set — every hand-
  published item has one, an automatically published calendar entry never
  does (that line is interpretation; see "Two intake paths" above).
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

### Publishing a real item without either script

The fetch/promote scripts (see "Two intake paths" above) are the normal
path, but nothing about the format requires them. `data/radar.json` is
plain JSON: open it, copy one existing entry inside `"items"` as a
template, fill in `category` (one of `rathaus`, `baustelle`, `foerderung`,
`frequenz`, `stadt`, `recht`), `headline`, `summary`, optionally `action`
(the "Was das für Sie heißt" line — required for every business category,
never write one for a `frequenz` item you didn't personally verify),
`sourceName` + `sourceUrl` (never publish without a real source),
`date` (`YYYY-MM-DD`), `urgency` (`"low"`/`"mid"`/`"high"` — `"high"` only
for something genuinely time-critical), `deadline` (a real date or `null`,
never invented), a unique `slug`, and `origin: "manual"`. Save, commit,
deploy — no database, no admin panel, no build script required first.

If `data/radar.json` still carries its `_note` field (only true before the
very first real item is published), delete that field once every entry is
real — that's the switch `RADAR_ITEMS_ARE_PLACEHOLDER` reads. This exists
because an earlier seed array briefly rendered fabricated headlines on the
homepage attributed to real institutions (Stadt Offenbach, WIBank, IHK
Offenbach am Main) that never published any of it — see the git history
for the fix.

### What the first live sample found

Running `radar:fetch` against both feeds for real (no classifier — see
"Two intake paths" above for why that was removed) surfaced 40 candidate
items. Four were genuinely worth publishing. That 10% hit rate is the
expected shape of this module, not a shortfall to optimize away — the
whole design (a strict business list, a low-bar calendar, an automatic
path that only ever touches the calendar) is built around most feed
volume being noise for a business owner. A month that produces three
business-list items and a handful of calendar entries is this module
working correctly, not underperforming.

## Visual verification

```bash
npx playwright install chromium --with-deps   # once
npx playwright test                           # runs tests/visual.spec.ts
```

Screenshots land in `test-results/visual/` (gitignored) — every route, both
themes, 1360/900/420/360px, and the run fails on any console error or
warning, horizontal overflow, or an image missing explicit dimensions. Read
the PNGs afterwards; a passing run only proves nothing crashed, not that the
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
- More OF-Radar business-list items as they come up — run `npm run
  radar:fetch` periodically and check `data/radar.inbox.json`, or just
  watch for the "OF-Radar: neue Termine" pull request the GitHub Actions
  workflow opens for calendar entries;
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
