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
  JSON-LD, a locally-cached OpenStreetMap crop (see "Member data" below — never a
  live third-party request), and an "other businesses on this street" block.
  **Currently shows an honest "Verzeichnis im Aufbau" state** — see below.
- **`/mitglied-werden`** — benefits, an open (currently TODO-COPY) fee table, and
  an application form that posts to `/api/mitglied-werden` and sends mail via
  Resend. No database yet — see "Email and forms" below.
- Stubs remain for `/verein`, `/veranstaltungen`, `/radar`, `/kontakt` — next steps;
- 301 redirects from the old `.php` URLs in `next.config.ts`.

### What's left

1. `/veranstaltungen` full event pages, `/verein` (history, Satzung, Vorstand),
   `/kontakt` (same form component as `/mitglied-werden`, fewer fields).
2. **OF-Radar**: schema in Postgres (Neon + Drizzle) → `/api/radar/ingest` on a
   Vercel Cron → classification via the Anthropic API → editorial gate at
   `/admin/radar` → public UI with filters, deadline countdowns, and a frequency
   calendar. Currently runs on seed data in `data/content.ts`.
3. Accessibility and performance pass, OG images via `next/og`.
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
3. `npm run geocode` resolves each address via Nominatim and fetches the small
   OpenStreetMap tile crop used on the member's page, caching everything under
   `public/maps/<slug>/`. **This is the only thing in the whole project that
   talks to Nominatim or the OSM tile server, and it only runs when you run it —
   never during `next build` and never at request time.** Both respect OSM's
   usage policies: a descriptive User-Agent with a real contact address
   (`TreffpunktOffenbachWebsite/1.0 (info@treffpunkt-offenbach.com)`) and a
   1.1-second pause between every single request, geocode or tile, combined.
   Re-running it is cheap — it skips anything already cached.
4. Once the list is confirmed real and every business has consented to being
   published, remove the `TODO-COPY` marker from `data/members.json`'s `_note`
   field by hand. This is deliberately a manual, one-line, conscious step —
   going live isn't a side effect of running a script.

Why a local image instead of a live map embed: the site's whole premise is no
third-party requests and therefore no cookie banner. A `<img>` pointing at a
map provider on every page view would hand that provider every visitor's IP,
the same problem Google Fonts would have caused — which is why `scripts/geocode-members.mjs`
fetches the map tiles once, at import time, and the page only ever reads the
local files it produced.

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

## From the board, still needed

- The real member list and consent to publish it (see "Member data" above);
- Vereinsregister number and founding year, for the Impressum;
- Membership fee amounts, for the open fee table on `/mitglied-werden`;
- How long submitted form data should be kept — the consent text on the form
  has a `TODO-COPY` placeholder for this;
- Proofreading of the German copy — it's written as working drafts;
- The old PDF membership application, if the board wants it kept as a
  download alternative to the form (we don't have a copy of it).
