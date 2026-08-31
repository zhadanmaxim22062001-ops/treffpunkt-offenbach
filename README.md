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
- `tests/visual.spec.ts` (Playwright) — screenshots every route in both themes
  at 1360px and 420px and fails on any console error. See "Visual verification"
  below.

### What's left

1. **OF-Radar**: schema in Postgres (Neon + Drizzle) → `/api/radar/ingest` on a
   Vercel Cron → classification via the Anthropic API → editorial gate at
   `/admin/radar` → public UI with filters, deadline countdowns, and a frequency
   calendar. Currently runs on seed data in `data/content.ts`.
2. Accessibility (axe-core) and performance pass, OG images via `next/og`.
3. Deploy.

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
  Vercel and Resend, and which Art. 44 DSGVO transfer basis applies to each —
  both are US companies, both are flagged `TODO-COPY` on `/datenschutz`;
- Satzung and a fuller Vereinsgeschichte for `/verein`, if the board wants
  more there than the current Vorstand list;
- Proofreading of the German copy — it's written as working drafts;
- The old PDF membership application, if the board wants it kept as a
  download alternative to the form (we don't have a copy of it).
