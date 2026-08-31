# Treffpunkt Offenbach — ребрендинг: промпты

Знак: **OF-Siegel** — монограмма, «F» внутри кольца, верхняя перекладина проходит сквозь разрыв в кольце.

---

## ПРОМПТ 1A — Midjourney v7 (пропорции знака)

```text
Minimal flat vector monogram logo for a German local business association: the letters O and F locked together. A thin, perfectly circular ring forms the O. Inside it sits a bold geometric capital F built from three straight strokes of identical weight — one vertical stem and two horizontal arms, flat butt ends, no tapering, no serifs. The upper arm of the F is longer than the ring is wide: it runs straight through the ring and continues a short distance outside it, and the ring is interrupted by a clean gap exactly where the arm crosses, so the arm unmistakably passes THROUGH the circle instead of lying on top of it. Everything constructed on a strict geometric grid, generous negative space, optically centred, stamp-like clarity. Exactly two flat colours: deep ink slate #101A1D for the ring, warm signal red #E23D1F for the F. Presented as a clean logo presentation sheet on a light chalk-grey #E9ECEA background, a 2x2 grid of four variations of this same single idea, differing only in stroke weight, how far the arm protrudes past the ring, the width of the gap in the ring, and the proportions of the F. Swiss design discipline, monogram seal, vector-ready, print quality.
--no serif letterforms, extra letters, words, text labels, numbers, people, buildings, globe, handshake, mockup, photograph, texture, noise, gradient, drop shadow, glow, bevel, 3d render, isometric
--ar 1:1 --style raw --stylize 150 --v 7
```

---

## ПРОМПТ 1B — Nano Banana / Gemini / GPT Image

```text
Design a minimal flat vector monogram logo for a German local business association, and output one square image.

The mark locks together the letters O and F. A thin, perfectly circular ring forms the O. Inside it sits a bold geometric capital F built from three straight strokes of identical weight: one vertical stem and two horizontal arms, flat butt ends, no tapering, no serifs. The upper arm of the F is longer than the ring is wide — it runs straight through the ring and continues a short distance outside it, and the ring is interrupted by a clean gap exactly where the arm crosses, so the arm clearly passes THROUGH the circle rather than sitting on top of it. That gap is the point of the design; never close it.

Rules: strict geometric construction, identical stroke weight everywhere, generous negative space, optically centred with even margins. Exactly two flat colours and no others — deep ink slate #101A1D for the ring, warm signal red #E23D1F for the F. Background flat chalk grey #E9ECEA.

Absolutely no serifs, no additional letters or words, no numbers, no buildings, people, globes or handshakes, no gradients, shadows, glow, texture, 3D or mockups. Pure flat 2D vector artwork, print quality, Swiss graphic design discipline, stamp-like.
```

---

## ПРОМПТ 2 — Claude Code: production-SVG логотипа OF-Siegel

```text
Create the production logo files for "Gewerbeverein Treffpunkt Offenbach e. V." as hand-authored, optimised SVG. No image generation, no auto-tracing — write the path data yourself from the geometry below, exactly as given. Every number here is deliberate; do not "improve" the proportions.

## The mark: "OF-Siegel"
A monogram. A capital F sits inside a ring that reads as O. The F's upper arm runs straight through the ring and out the other side, and the ring carries a gap exactly where the arm crosses, so the arm passes THROUGH the O rather than lying on top of it. That gap is the whole idea. Never close it in the primary mark.

Canvas: viewBox "0 0 240 240". All strokes: stroke-width 13, fill none, stroke-linecap butt, stroke-linejoin miter.

Ring, an open arc of 330 degrees running clockwise from -22 degrees round to -52 degrees, leaving a 30 degree gap in the upper right:
  d="M189.88 88.53 A84 84 0 1 1 163.72 53.81"     (centre 112,120 · radius 84)
  colour: ink #101A1D
F, stem plus upper arm as ONE path, drawn from the bottom of the stem so it can animate as a single stroke:
  d="M80 170 L80 72 L218 72"
F, crossbar:
  d="M80 116 L152 116"
  colour for both: signal red #E23D1F

Verify these numerically before you commit anything:
- The ring's centreline crosses y=72 at x=180.93, so the arm's 13-wide band passes through the gap with about 7 units of clearance at each cut end. If you move the gap, recompute both clearances.
- The arm ends at x=218 while the ring's outer silhouette ends at x=202.5, so the arm protrudes 15.5 units. That protrusion is a signature, not an accident.
- Ink bounding box is x 21.5 to 218 and y 29.5 to 210.5, putting the optical centre at (119.75, 120) on the 240 canvas. Change anything and you re-centre.
- The crossbar is 71 percent of the arm's visible run inside the ring and sits at 45 percent of the stem height, slightly above true middle. Keep both ratios.

## The compact mark, for anything below 64 px
Below 64 px the gap reads as a nick and the protruding arm reads as a stray dash. This is a separate optical drawing, never a scaled copy of the primary:
  ring:     circle centre (112,120) radius 84, stroke-width 19, closed, no gap
  F:        d="M80 168 L80 74 L206 74"   stroke-width 19
  crossbar: d="M80 118 L150 118"         stroke-width 19
Same two colours. The crossover point between the two drawings is 64 px; state it in the README.

## Deliverables in /public/brand
1.  mark.svg             primary, with the gap
2.  mark-compact.svg     the sub-64px drawing above
3.  mark-mono.svg        primary geometry with every stroke set to currentColor
4.  mark-inverse.svg     for dark grounds: ring #E9ECEA, F #FF5A38
5.  favicon.svg          the compact drawing, ink ring and red F, transparent background
6.  favicon-32.png and apple-touch-icon.png (180px, compact mark on #E9ECEA with 22px padding), rendered by a committed script scripts/brand-raster.mjs using resvg or sharp
7.  lockup-h.svg         mark at 56px height, 20px gap, then a two-line wordmark: "TREFFPUNKT" in Archivo 800 with tracking -0.045em above "OFFENBACH" in Archivo 500 with tracking 0.35em. The two lines must be optically the same width — adjust the tracking of the lower line, never its size. Align the cap height of TREFFPUNKT with the top of the ring and the baseline of OFFENBACH with the bottom of the ring. Convert text to outlines, and also keep lockup-h-live-text.svg with real text elements for later editing.
8.  lockup-v.svg         mark centred above the same wordmark, 24px gap, centre-aligned
9.  sticker.svg          a window decal for members, 320x320: the compact mark centred above the words "MITGLIED IM" and "TREFFPUNKT OFFENBACH" set small in Archivo 600, ink on #E9ECEA, with a 4px ink border inset 10px from the edge. This is a real deliverable — every member business puts it on their door, so make it work at 60mm printed.
10. clearspace.svg       the horizontal lockup with a dashed clear-space frame set at 26 units (twice the stroke width) on every side

## Rules
- Hand-written, readable path data with sensible indentation. No embedded images, no base64, no filters, no gradients, no style blocks. Prefix every id and class with "tpof-" so several inlined SVGs on one page cannot collide.
- Every file gets role="img" and a title element reading "Treffpunkt Offenbach". Omit width and height attributes so CSS controls size. Set preserveAspectRatio="xMidYMid meet".
- Run SVGO with removeViewBox disabled. Commit both source and optimised output.
- Build brand-sheet.html: one self-contained page showing every file on a light #E9ECEA ground and a dark #0D1517 ground at 16, 24, 40, 96 and 320 px, plus a pure black-and-white test and a 60 percent blur test. Include a direct side-by-side of mark.svg and mark-compact.svg at 40, 56 and 72 px so the crossover size can actually be judged.
- Then open brand-sheet.html and look at it. Tell me at which size the gap stops reading and whether the 64 px crossover should move, before you tell me anything is finished.
```

---

## ПРОМПТ 3 — Claude Code: сайт treffpunkt-offenbach.de

```text
# Project: treffpunkt-offenbach.de — website for a German business association

You are building a production website for "Gewerbeverein Treffpunkt Offenbach e. V.", a business association in Offenbach am Main, Germany, with around 100 member businesses across retail, gastronomy, crafts and services. The site language is GERMAN, formal "Sie". Deploy target is Vercel.

## Non-negotiables
- Read this entire brief first. Then propose a file tree and a plan, and WAIT for my approval before generating anything beyond the scaffold.
- No lorem ipsum anywhere. Use the real German copy in this brief; where copy is missing, write real German copy and mark the spot with a TODO-COPY comment.
- No cookie banner. Achieve that by using zero cookies and zero third-party embeds: fonts self-hosted at build time, maps as static images, analytics only Vercel Web Analytics (cookieless).
- Definition of done: clean production build, zero TypeScript errors, zero console errors or warnings, Lighthouse mobile Performance 90+ and Accessibility 100.

## Stack
- Next.js 15 App Router, TypeScript strict, React Server Components by default, client components only where interaction demands it
- Tailwind CSS v4, CSS-first config via @theme in app/globals.css
- motion (framer-motion v11+) for animation, dynamically imported, client-side only
- lenis for smooth scrolling, disabled under prefers-reduced-motion
- next/font/google for Archivo, Newsreader and IBM Plex Mono — self-hosted at build time, never fetched from Google at runtime (DSGVO)
- Content: MDX with typed frontmatter in /content for pages and events; /data/members.json for the directory. No CMS in v1, but put everything behind /lib/content so Sanity can slot in later.
- Database for the news module only: Postgres on Neon with Drizzle ORM
- next-sitemap, JSON-LD (Organization sitewide, Event per event, LocalBusiness per member)

## Design system — implement exactly
Colour tokens (light, then dark):
  ink      #101A1D / #E4EAE7
  ink-2    #2C3A3E / #B4C1BE
  paper    #E9ECEA / #0D1517
  paper-2  #F4F6F4 / #141F22
  line     #C6CFCB / #2A3A3D
  accent   #E23D1F / #FF5A38   Signalrot — CTAs, deadlines, urgency. Small areas only.
  river    #1F6F6B / #4FB3AB   Main-Gruen — category tags, positive and "all clear" states. Never appears in the logo.
Rough colour ratio 80 neutral / 15 river / 5 accent. The accent never covers a large surface.
Support both themes via prefers-color-scheme AND an explicit toggle on a data-theme attribute; define every colour as a token, never inline a hex in a component.

Type:
  Display and UI: Archivo. Hero at weight 800, tracking -0.035em. Section headings 800 at clamp(26px, 3.4vw, 38px).
  Body: Newsreader. Weight 300 for leads, 400 for running text, max 66ch measure, line-height 1.6.
  Data and labels: IBM Plex Mono at 11px, uppercase, letter-spacing 0.14em for eyebrows. tabular-nums on every date, price and countdown.

Layout: 1180px max width, 24px gutters. The visual language is a printed spec sheet, not a SaaS dashboard: 1px hairline borders in the `line` token instead of drop shadows, border-radius 0 everywhere except pills (999px) and images (2px). No shadows at all. Space siblings with flex/grid gap, not margins.

Logo: I will place mark.svg, mark-compact.svg, mark-mono.svg, favicon.svg, lockup-h.svg, lockup-v.svg and sticker.svg in /public/brand. Consume those files, never invent or redraw a logo. The mark is a monogram, an F inside a ring, whose upper arm passes through a gap in the ring. There are two drawings, not one: mark.svg above 64px, mark-compact.svg at 64px and below (nav bar, favicon, mobile header). Wire that crossover into the Logo component so nobody has to remember it.

## Routes (German)
/                        Startseite
/verein                  Ueber uns, Vorstand, Geschichte
/mitglieder              Mitgliederverzeichnis, filterable
/mitglieder/[slug]       Member profile
/mitglied-werden         Benefits, Beitragstabelle, application form
/veranstaltungen         Events overview
/veranstaltungen/[slug]  Single event
/radar                   OF-RADAR, the news module — see below
/radar/[slug]            Single radar item
/kontakt                 Contact and form
/impressum  /datenschutz

Real data for the footer and Impressum: Gewerbeverein Treffpunkt Offenbach e. V., Frankfurter Str. 7, im Hause M. Schneider, 63065 Offenbach am Main. Telefon 0160 92240226. E-Mail info@treffpunkt-offenbach.com. Vorstand: Stefan Becker (1. Vorsitzender), Klaus Kohlweyer (2. Vorsitzender), Tobias Allmeroth (Kassenwart), Juergen Proske (Schriftfuehrer), Roland Nowak (stellv. Schriftfuehrer), Birgitt Moebus, Ursula Oelcer, Matthias Roth, Guenther Roesler (Beisitzer). Ask me for the Vereinsregister number and the founding year rather than inventing them.

## Startseite, section by section
1. Hero: the animated logo mark (SVG line-draw), H1 "Der Treffpunkt fuer alle, die in Offenbach etwas aufbauen.", one supporting line, two CTAs — "Mitglied werden" (accent) and "OF-Radar ansehen" (outline).
2. Kennzahlen strip: four figures that count up when scrolled into view — Mitgliedsbetriebe, Jahre Offenbacher Woche (the 2026 edition was the 28th), Veranstaltungen pro Jahr, Besucher in der Innenstadt. Use TODO-COPY placeholders for numbers I have not given you.
3. "Was wir machen": three cards — Innenstadt beleben / Netzwerk / Interessen vertreten.
4. OF-Radar teaser: the three newest items plus a link to the full feed.
5. Mitglieder-Marquee: member logos scrolling horizontally, pausing on hover and focus, linking into the directory.
6. Naechste Veranstaltung: one large date card. Real events to seed: Offenbacher Woche (28. bis 31. Mai, 28th edition in 2026), Lichterfest im Buesingpark, verkaufsoffene Sonntage, weihnachtliche Innenstadtbeleuchtung.
7. Closing CTA band on the ink ground: join the association.

## Mitgliederverzeichnis
Server-rendered list with client-side filtering by Branche (Einzelhandel, Gastronomie, Handwerk, Dienstleistung, Gesundheit, Bildung) and by Stadtteil or street, plus free-text search. Filter state lives in searchParams so a filtered view is shareable. Cards show name, Branche, street and one line of description. Each member page: description, opening hours, address, a static map image (never an embedded Google Map), link to their own site, and a "andere Betriebe in derselben Strasse" block. This directory is the association's main SEO asset — get the structured data right.

## Mitglied werden
Benefit list, a transparent Beitragstabelle, then a form (Name, Betrieb, Branche, Adresse, E-Mail, Telefon, Nachricht, consent checkbox) posting to a Route Handler that mails via Resend and writes to the database. Honeypot field plus rate limiting, no third-party captcha. Show the success state in place, no redirect. Keep the existing PDF as a download fallback.

## THE SPECIAL MODULE: /radar — "OF-RADAR"
This is the reason people come back to the site. It is a curated, machine-assisted feed of news about Offenbach am Main, filtered by exactly one question: does this change anything for a business owner in this city? General city news does not belong here.

Implement these six categories, each with its own chip colour, icon and filter:
1. rathaus     Rathaus und Regeln — decisions of the Magistrat and Stadtverordnetenversammlung that touch businesses: Gewerbesteuer-Hebesatz, Sondernutzungserlaubnis for outdoor seating and goods displays, Ladenoeffnung and verkaufsoffene Sonntage, Innenstadt- and Gestaltungskonzepte.
2. baustelle   Baustellen und Erreichbarkeit — road closures, tram and bus changes, parking, Sperrungen. Every item carries a list of affected streets, and members whose address is on one of those streets get the item pinned to the top of their feed.
3. foerderung  Foerderung und Fristen — funding programmes from Land Hessen and WIBank, the federal government, the EU and IHK Offenbach, each with a one-line eligibility note and a deadline countdown.
4. frequenz    Frequenz-Kalender — every event that pulls people into the city: Offenbacher Woche, Lichterfest, Mainuferfest, Weihnachtsmarkt, trade fairs, OFC home games, with an expected-footfall band so members can plan staffing and stock.
5. stadt       Stadt entwickelt sich — Kaiserlei, Hafen Offenbach, new housing and office projects, incoming anchor tenants: where tomorrow's customers come from.
6. recht       Recht und Kosten kompakt — national rules with a date (Mindestlohn, E-Rechnungspflicht, Kassenrecht, Verpackungsgesetz, Barrierefreiheit), one paragraph plus a line saying what to do by when.
Keep `ausschreibung` (city tenders) and `fachkraefte` (apprenticeship and IHK dates) in the type union but disabled in v1.

Pipeline:
- /lib/radar/sources.ts — a typed list of sources: feed URL, publisher name, licence note, category hints. Start from: offenbach.de Pressemeldungen, of-news.de, op-online.de Offenbach, hessenschau.de Offenbach, IHK Offenbach am Main, Handwerkskammer Frankfurt-Rhein-Main, foerderdatenbank.de filtered to Hessen, and RMV traffic notices. Fetch and verify each feed URL before hard-coding it; where a source has no feed, write an adapter and mark it clearly as fragile.
- Vercel Cron daily at 06:00 Europe/Berlin hitting /api/radar/ingest, protected by CRON_SECRET.
- Ingest: fetch, parse with rss-parser, dedupe on a hash of the canonical URL, then for each new item call the Anthropic API with structured output returning: relevant (boolean), category, audience (einzelhandel | gastronomie | handwerk | dienstleistung | alle), streets (string array), urgency (low | mid | high), deadline (date or null), headline_de (max 70 characters, plain German, no clickbait), summary_de (two sentences), action_de (one sentence: what this means for you). Irrelevant items are stored as rejected, not deleted, so the classifier can be tuned against real data.
- COPYRIGHT RULE, enforce it in code: never store or display the body text of a source article. Store only our own headline and summary, the publisher name, the publication date and the canonical link. Every card renders "Quelle: NAME, dd.mm.yyyy" as an outbound link.
- EDITORIAL GATE: items land with status "draft". Build a minimal /admin/radar behind Basic auth in middleware (ADMIN_PASSWORD env) listing drafts with approve, edit and discard. Only published items are public. It must be usable on a phone in ten seconds — this is a volunteer board, not a newsroom.

Frontend of /radar:
- Sticky filter bar: category chips plus a "Fuer mich relevant" toggle reading a locally stored profile (Branche and street) from localStorage, wrapped in try/catch, no account, no cookie.
- Items render as a dense list, not a blog: mono date, category chip, headline in Archivo 600, summary in Newsreader, the action line in a tinted box, source link. urgency high gets a 3px accent rule on the left.
- Items with a deadline show a countdown ("noch 12 Tage") in tabular-nums and offer a client-generated .ics download.
- frequenz items also render on a horizontal 12-week timeline pinned to the top of the page, with footfall bands.
- Weekly digest signup with double opt-in via Resend, sent Monday 07:00 with the last seven days.
- Expose /radar/feed.xml so members can subscribe in their own reader.

## Animation brief
Purpose over decoration. Implement these and nothing else:
- Hero logo draw-on on first load, once per session via sessionStorage: the ring arc draws first (0.85s), then the F's stem-and-arm draws as one continuous stroke starting at the bottom of the stem, so the upper arm visibly shoots out through the gap in the ring, then the crossbar snaps in. Total about 1.4s, easing [0.4, 0, 0.15, 1] on the F.
- Section reveals: opacity 0 to 1 plus 16px upward translate, 0.5s, 60ms stagger, triggered once at 20% viewport.
- Kennzahlen count-up on enter.
- Member marquee: CSS-only infinite scroll, 40s, pauses on hover and focus-within.
- Buttons: 120ms background transition. Text links: a 2px underline growing from the left.
- Page transitions via the View Transitions API where supported, no JS fallback needed.
- Radar filter chips: layout animation on the active indicator only.
Wrap all of it so prefers-reduced-motion reduce removes movement and collapses fades to near-instant. Test that path explicitly.
Explicitly forbidden: parallax, scroll-jacking, 3D, particle backgrounds, scroll-driven video, animated gradient blobs.

## Accessibility and quality
- WCAG 2.2 AA. Proper landmarks, exactly one h1 per page, visible focus ring (accent, 2.5px, 3px offset), a skip link, full keyboard reachability, form errors wired with aria-describedby.
- lang="de" and hyphens: auto so German compounds break correctly.
- next/image with AVIF and WebP, explicit sizes, zero layout shift.
- Per-route metadata, OG images generated with next/og in the brand palette.

## Deployment
- Vercel project "treffpunkt-offenbach", region fra1.
- Env vars: DATABASE_URL, ANTHROPIC_API_KEY, RESEND_API_KEY, CRON_SECRET, ADMIN_PASSWORD, NEXT_PUBLIC_SITE_URL.
- vercel.json with the cron entry. Write a README with exact setup steps and a checklist for pointing the existing domain (treffpunkt-of.de and treffpunkt-offenbach.com) at the new deployment, including 301 redirects from the old .php URLs.

## Working order — one step at a time, stop after each
1. Confirm the plan and the file tree. Wait for me.
2. Scaffold, design tokens, shared UI (Button, Section, Eyebrow, Card, Chip, Prose, ThemeToggle) and a /styleguide route rendering all of it. Show me that before continuing.
3. Layout, navigation, footer, Startseite.
4. Mitgliederverzeichnis and Mitglied werden.
5. Veranstaltungen.
6. OF-Radar in this order: schema, ingest, admin, public UI. Seed 15 realistic sample items first so the UI can be judged before the pipeline runs.
7. Accessibility and performance pass, then README and deploy.
Commit after each step with a conventional-commit message. Ask before adding any dependency not named in this brief.
```
