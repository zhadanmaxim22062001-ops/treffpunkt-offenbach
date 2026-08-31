# Промпт для Claude Code: доделать и задеплоить treffpunkt-offenbach

Запускать **внутри папки `site/`** уже существующего проекта (`claude`, затем вставить всё ниже).
Проект наполовину собран — промпт продолжает работу, а не начинает с нуля.

---

```text
You are continuing an existing project, not starting one. Read this entire brief, then read the actual files before proposing anything. Do not rewrite what already works.

## PROJECT
Website for "Gewerbeverein Treffpunkt Offenbach e. V.", a business association in Offenbach am Main, Germany, ~100 member businesses. Site language is GERMAN, formal "Sie". Target: production deployment on Vercel with the association's existing domains pointed at it.

## CURRENT STATE — already built and working
Stack, all installed and pinned in package.json:
  next 16.3, react 19.2, typescript, tailwindcss 4.3 (@tailwindcss/postcss), motion 13.1, lenis 1.3, clsx
Production build passes clean. 28 routes prerender. Zero TS errors, zero console errors.

File tree that exists today:
  app/globals.css              design tokens + base + components layers
  app/layout.tsx               fonts, metadata, JSON-LD Organization, skip link, noscript reveal fallback
  app/page.tsx                 Startseite, complete, 7 sections
  app/styleguide/page.tsx      internal component sheet
  app/impressum/page.tsx       real data
  app/datenschutz/page.tsx     real data
  app/verein|mitglieder|veranstaltungen|radar|kontakt|mitglied-werden/page.tsx   placeholders
  app/mitglieder/[slug]/page.tsx        minimal, generateStaticParams from members.json
  app/veranstaltungen/[slug]/page.tsx   minimal, Event JSON-LD
  components/ui.tsx            Container, Section, Eyebrow, Heading, Lead, Button, Card, Chip, Rule
  components/Logo.tsx          LogoMark, LogoLockup
  components/Header.tsx        sticky nav + mobile nav + ThemeToggle
  components/Footer.tsx        contact, sitemap, "keine Cookies"
  components/ThemeToggle.tsx   three states: system / light / dark
  components/motion.tsx        Reveal, CountUp, SmoothScroll
  components/Placeholder.tsx   stub page component — delete each stub as you replace it
  data/verein.ts               VEREIN, VORSTAND, KENNZAHLEN
  data/content.ts              EVENTS, LEISTUNGEN, RADAR_CATEGORIES, RADAR_SEED
  data/members.json            12 placeholder members, flagged TODO-COPY
  lib/fonts.ts                 next/font/local
  public/brand/*               finished logo package, do not redraw anything
  public/fonts/*               Archivo 500/600/800, Newsreader 300/400, IBM Plex Mono 500
  next.config.ts               301 redirects from the old .php URLs

## HOUSE RULES — these are not suggestions
1. Colour never appears as a literal in a component. Everything reads the theme tokens: var(--c-ink), --c-ink-2, --c-paper, --c-paper-2, --c-line, --c-muted, --c-accent, --c-accent-soft, --c-river, --c-river-soft, --c-invert-bg, --c-invert-fg. Tailwind's @theme maps --color-* onto those same vars, so bg-paper / text-ink / border-line switch with the theme. If you add a colour, add it as a token in all three theme blocks (:root, the prefers-color-scheme block, and :root[data-theme="dark"]) or it will render one theme's text on the other theme's ground.
2. Three theme states, not two. The default is "system" and stamps nothing on <html>. Never write a colour whose only definition sits inside a media query or a [data-theme] block.
3. Visual language is a printed spec sheet, not a SaaS dashboard: 1px hairline borders in --c-line, no drop shadows anywhere, border-radius 0 except pills. Space siblings with flex/grid gap.
4. Type: Archivo for display and UI (800 for headings, tracking -0.03em), Newsreader for running text (max 66ch), IBM Plex Mono for eyebrows, dates and data. tabular-nums on every number, date and countdown.
5. Colour ratio roughly 80 neutral / 15 river / 5 accent. Signalrot marks one thing per screen: the primary action, or urgency. Never a large accent surface.
6. The logo has TWO drawings. components/Logo.tsx switches at 64px on its own — use LogoMark and never hand-place an SVG.
7. No cookies, no third-party embeds, no external font requests, no captcha service, no map iframes. Static map images only. Analytics: Vercel Web Analytics (cookieless) or nothing.
8. Never invent facts about the association. Everything unknown is marked TODO-COPY and listed at the end of your work. Currently unknown: exact member count, founding year, Vereinsregister number and court, membership fees, the real member list.

## KNOWN TRAPS — found the hard way, do not re-introduce
- lenis intercepts window.scrollTo. Anchor links and any programmatic scroll must go through the lenis instance. Export it from components/motion.tsx (a small context or a module-level ref) and use lenis.scrollTo for the radar filter jumps and any "nach oben" link. Test with keyboard focus too: focus must follow the scroll target.
- motion's useReducedMotion can resolve after first paint, so a reveal can flash. Reveal already carries data-reveal and layout.tsx has a <noscript> rule forcing opacity 1 — keep both. Any new animated wrapper gets data-reveal for the same reason.
- Tailwind v4 @theme with literal hex values silently breaks dark mode. It must reference the --c-* vars. This already bit us once.

## WORK TO DO — one step at a time, stop and show me after each
Commit after every step with a conventional-commit message. Ask before adding any dependency not named here.

### Step 1 — Mitgliederverzeichnis
/mitglieder: server-rendered list, client-side filter by Branche (Einzelhandel, Gastronomie, Handwerk, Dienstleistung, Gesundheit, Bildung) and by Straße, plus free-text search. Filter state lives in searchParams so a filtered view is shareable and indexable. Cards: name, Branche, Straße, one line.
/mitglieder/[slug]: description, opening hours, address, static map image (never an embedded map), link to their own site, and an "andere Betriebe in derselben Straße" block. LocalBusiness JSON-LD per member.
Extend data/members.json with the fields you need and keep the TODO-COPY note at the top. This directory is the association's main SEO asset — get the structured data and the internal linking right.

### Step 2 — Mitglied werden
Benefits, a transparent Beitragstabelle (values TODO-COPY), then a form: Name, Betrieb, Branche, Adresse, E-Mail, Telefon, Nachricht, consent checkbox. POST to a Route Handler that sends mail via Resend and appends to the database. Honeypot field plus IP rate limiting, no third-party captcha. Success state rendered in place, no redirect. Server-side validation with zod (ask first). Keep the old PDF as a download fallback.

### Step 3 — Veranstaltungen und Verein
/veranstaltungen: full pages per event from data/content.ts, each with Event JSON-LD and a client-generated .ics download. /verein: history, Satzung, the full Vorstand from data/verein.ts with roles.
/kontakt: same form component as step 2, reduced fields.
Delete components/Placeholder.tsx once nothing imports it.

### Step 4 — OF-RADAR, the module the whole site exists for
A curated, machine-assisted feed of Offenbach news filtered by exactly one question: does this change anything for a business owner in this city? General city news does not belong here.

Six categories, already typed in data/content.ts — keep the keys:
  rathaus     Rathaus und Regeln: Magistrat and Stadtverordnetenversammlung decisions touching businesses — Gewerbesteuer-Hebesatz, Sondernutzungserlaubnis for outdoor seating and goods displays, Ladenöffnung and verkaufsoffene Sonntage, Innenstadt- and Gestaltungskonzepte
  baustelle   Baustellen und Erreichbarkeit: closures, tram and bus changes, parking. Each item carries affected streets; members on those streets get it pinned
  foerderung  Förderung und Fristen: Land Hessen and WIBank, federal, EU, IHK Offenbach — one-line eligibility plus a deadline countdown
  frequenz    Frequenz-Kalender: everything that pulls people downtown — Offenbacher Woche, Lichterfest, Mainuferfest, Weihnachtsmarkt, Messen, OFC home games — with an expected-footfall band
  stadt       Stadt entwickelt sich: Kaiserlei, Hafen Offenbach, new housing and offices, incoming anchor tenants
  recht       Recht und Kosten kompakt: national rules with a date — Mindestlohn, E-Rechnungspflicht, Kassenrecht, Verpackungsgesetz, Barrierefreiheit — one paragraph plus what to do by when
Keep `ausschreibung` and `fachkraefte` in the type union, disabled in v1.

Build in this order, stopping between each:
4a. Schema. Postgres on Neon with Drizzle. Tables: sources, items (url_hash unique, status draft|published|rejected, category, audience[], streets[], urgency, deadline, headline_de, summary_de, action_de, source_name, source_url, published_at, created_at), digest_subscribers (double opt-in: token, confirmed_at). Migrations committed.
4b. Ingest. lib/radar/sources.ts — a typed list: feed URL, publisher, licence note, category hints. Start from offenbach.de Pressemeldungen, of-news.de, op-online.de Offenbach, hessenschau.de Offenbach, IHK Offenbach am Main, Handwerkskammer Frankfurt-Rhein-Main, foerderdatenbank.de filtered to Hessen, RMV traffic notices. FETCH AND VERIFY EVERY FEED URL BEFORE HARD-CODING IT — German local publishers often have no feed or serve headlines only. Report which ones actually work; where there is no feed, write an adapter and mark it fragile.
    /api/radar/ingest, protected by CRON_SECRET: fetch, parse with rss-parser, dedupe on a hash of the canonical URL, then for each new item call the Anthropic API with structured output returning relevant (boolean), category, audience, streets, urgency, deadline, headline_de (max 70 chars, plain German, no clickbait), summary_de (two sentences), action_de (one sentence, "Was das für Sie heißt"). Irrelevant items are stored as rejected, never deleted, so the classifier can be tuned against real data.
    COPYRIGHT RULE, enforce it in the code and not just in a comment: never store or render the body text of a source article. Only our own headline and summary, the publisher name, the publication date and the canonical link. Every card shows "Quelle: NAME, dd.mm.yyyy" as an outbound link.
4c. Editorial gate. Items land as draft. /admin/radar behind Basic auth in middleware (ADMIN_PASSWORD): list drafts, approve, edit, discard. Only published items are public. It has to be usable on a phone in ten seconds — this is a volunteer board, not a newsroom. Nothing is ever published automatically.
4d. Public UI. Sticky filter bar with category chips and a "Für mich relevant" toggle reading a locally stored profile (Branche and Straße in localStorage, wrapped in try/catch, no account, no cookie). Items as a dense list, not a blog: mono date, category chip, headline in Archivo 600, summary in Newsreader, the action line in a tinted box, source link. urgency high gets a 3px accent rule on the left. Deadline items show "noch N Tage" in tabular-nums plus an .ics download. frequenz items also render on a horizontal 12-week timeline pinned to the top with footfall bands. /radar/[slug] per item. /radar/feed.xml so members can subscribe in their own reader.
4e. Weekly digest. Double opt-in via Resend, sent Monday 07:00 with the last seven days. Unsubscribe link in every mail.

### Step 5 — Quality pass
WCAG 2.2 AA: landmarks, one h1 per page, visible focus ring, full keyboard reachability, form errors wired with aria-describedby, colour contrast checked in BOTH themes. lang="de" with hyphens auto. next/image with explicit sizes, zero CLS. Per-route metadata. OG images with next/og in the brand palette. next-sitemap and robots.txt.
Verify it, do not assert it: install @playwright/test, write a small script that loads every route in light and dark at 1360 and 420 wide, captures a screenshot, fails on any console error, and runs an axe-core pass. Run Lighthouse against the production build. Report the actual numbers. If you cannot see the screenshots, say so instead of claiming the design looks right.

### Step 6 — DEPLOY
6a. Repository. git init if needed, .gitignore is already correct. Create the GitHub repo with `gh repo create treffpunkt-offenbach --private --source=. --push`. Ask me before making it public.
6b. Services. Tell me exactly what to click, then wait: Neon project in eu-central, Resend account with the sending domain verified (SPF and DKIM records — the digest will land in spam without them), Anthropic API key. You never paste secrets into the repo.
6c. Vercel. `vercel link` (project treffpunkt-offenbach, region fra1), then `vercel env add` for each of DATABASE_URL, ANTHROPIC_API_KEY, RESEND_API_KEY, CRON_SECRET, ADMIN_PASSWORD, NEXT_PUBLIC_SITE_URL — production and preview separately. Generate CRON_SECRET and ADMIN_PASSWORD yourself with openssl rand and show them to me once.
6d. vercel.json with the cron entries: /api/radar/ingest daily at 05:00 UTC (07:00 Berlin in summer, note the offset in a comment), /api/radar/digest Mondays 05:00 UTC. Confirm the plan actually allows the cron frequency you configured and say so.
6e. Run migrations against the production database, then `vercel --prod`. Verify the live URL: every route returns 200, the favicon and OG image render, the theme toggle survives reload, /admin/radar asks for auth, /api/radar/ingest rejects a request without the secret.
6f. Domains. The association holds treffpunkt-of.de and treffpunkt-offenbach.com. Decide with me which is canonical (I lean treffpunkt-offenbach.com since it is on their letterhead), add both in Vercel, give me the exact DNS records to set at the registrar, and make the non-canonical one 301 to the canonical. Confirm the .php redirects in next.config.ts still fire on the live deployment — those old URLs are what Google has indexed and they carry whatever ranking exists today.
6g. Hand-off. Update README.md with: how to run locally, what each env var is, how to add a radar source, how the Vorstand approves items, and how to roll back a deployment. Write a short German one-pager for the Vorstand explaining only how to use /admin/radar.

## DEFINITION OF DONE
Production build clean, zero TS errors, zero console errors on any route, Lighthouse mobile Performance 90+ and Accessibility 100, both themes verified, no cookie banner because there are no cookies, live on the canonical domain with the old URLs redirecting, and a README someone else could pick up.

## HOW TO WORK
Confirm the plan first and wait for me. Then one step at a time, stopping after each with what you built, what you verified and how. Never mark something done that you have not actually run. If a feed is dead, a service refuses, or a number is missing, say so and ask — do not fill the gap with something plausible.
```

---

## Что сделать до запуска

1. Распаковать `treffpunkt-offenbach-site.zip`, зайти в `site/`, выполнить `npm install` и `npm run build` — убедиться, что база собирается.
2. Завести аккаунты, они понадобятся на шаге 6: Neon, Resend, Vercel, ключ Anthropic API. GitHub CLI (`gh auth login`) и `vercel login` пройти заранее — интерактивный логин из-под агента не работает.
3. Спросить у правления то, что помечено TODO-COPY: число членов, год основания, номер в Vereinsregister, взносы, список участников с согласием на публикацию.

## Чем этот промпт отличается от первого

Первый промпт строил проект с нуля. Этот продолжает существующий: он описывает текущее дерево файлов, правила дизайн-системы и три ловушки, на которые я уже наступил при сборке (lenis против `window.scrollTo`, поздний `useReducedMotion`, литеральные цвета в `@theme`, ломающие тёмную тему). Без этого блока агент с высокой вероятностью повторит их и потратит на это ваши деньги.
