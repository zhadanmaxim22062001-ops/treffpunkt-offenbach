# Промпт для Claude Code — версия 1.1

Запускать в папке проекта. Заменяет предыдущие инструкции.

---

```text
Six changes to the live site, in this order. Confirm the plan, then work through it
stopping only where told. The site is deployed at treffpunkt-offenbach.vercel.app
and everything below ends with a new production deploy.

═══════════════════════════════════════════════════════════════════════
1. NEW PALETTE — white / blue / navy, replacing the ink-and-red scheme
═══════════════════════════════════════════════════════════════════════
This is a token swap, not a redesign. Every component already reads --c-* variables
and contains no colour literals, so this should touch app/globals.css and almost
nothing else. If you find yourself editing a component's colours, that component was
breaking the rule — fix it to read a token instead.

Light theme:
  --c-paper       #F5F9FC
  --c-paper-2     #FFFFFF
  --c-ink         #0B2138
  --c-ink-2       #33506B
  --c-line        #C9D8E5
  --c-muted       #56718C
  --c-accent      #0F5FA8
  --c-accent-soft #E1EDF9
  --c-signal      #A34515
  --c-signal-soft #FAE7DC
  --c-invert-bg   #0B2138
  --c-invert-fg   #F5F9FC

Dark theme (both the prefers-color-scheme block and [data-theme="dark"]):
  --c-paper       #08151F
  --c-paper-2     #0F2231
  --c-ink         #E4EFF7
  --c-ink-2       #A9C2D4
  --c-line        #25394B
  --c-muted       #7E9AB0
  --c-accent      #5AA9E8
  --c-accent-soft #102F49
  --c-signal      #E88B5A
  --c-signal-soft #2E1A10
  --c-invert-bg   #F5F9FC
  --c-invert-fg   #0B2138

These are contrast-checked against their own backgrounds and all pass AA: in light,
ink 15.4, ink-2 7.9, muted 4.8, accent 6.2, white-on-accent 6.5, signal 5.8; in dark,
ink 15.8, ink-2 10.0, muted 6.3, accent 7.3. Do not "improve" any of them without
re-running the numbers.

Important structural change: the old palette used --c-river (teal) as the secondary.
Blue is now the primary, so river has no role. Replace every --c-river / --c-river-soft
usage with --c-signal / --c-signal-soft, and note what signal now means: it is the
ONLY warm colour left in the system and it marks exactly one thing — urgency and
deadlines. Not tags, not decoration, not "positive states". Everything that used
river as a neutral tag colour becomes accent-soft instead.

Buttons: white text on --c-accent. On dark, --c-invert-fg (dark navy) text on the
lighter accent — check which passes and use that; do not assume white works on both.

Rough proportion across a page: 80 neutral, 15 blue, 5 signal.

═══════════════════════════════════════════════════════════════════════
2. NEW LOGO FILES — the mark is now navy + blue, not navy + red
═══════════════════════════════════════════════════════════════════════
A regenerated brand package is in treffpunkt-of-brand-blue.zip: same OF-Siegel
geometry, ring in #0B2138, F in #0F5FA8, plus inverse, compact, favicon, lockups,
sticker and rasters. Replace the whole contents of public/brand with it.
components/Logo.tsx draws the mark inline from tokens, so it will follow the palette
automatically — verify that it does and that the 64px compact threshold still works.

═══════════════════════════════════════════════════════════════════════
3. THE HERO BACKGROUND IS EMPTY — give it something
═══════════════════════════════════════════════════════════════════════
Do NOT use stock photography of Offenbach. We have no rights to any, and a Verein
site running an unlicensed city photo is a real risk, not a theoretical one.

Build the background from the brand's own geometry instead:
- A very large OF-Siegel, roughly 140% of the hero's height, anchored off the right
  edge so it bleeds out of frame, at 4–6% opacity in --c-accent. It must read as
  texture, not as a second logo — if you can identify it as the mark at a glance, it
  is too strong.
- Behind that, a soft radial field from --c-accent-soft toward --c-paper, top-right
  to bottom-left. Flat CSS gradients only, no images, no blur filters.
- On the ink-inverted CTA band, the same treatment with the inverse mark.
- Everything decorative gets aria-hidden and pointer-events:none, and must not push
  the LCP element or shift layout.

Then prepare for real photography, because that is what this eventually wants: add
an optional `image` slot to the hero that, when a file exists at
public/hero/innenstadt.jpg, renders it with next/image (priority, explicit sizes,
a --c-ink overlay at ~55% so the headline keeps its contrast) instead of the
geometric background. Leave it unset. In the README, add a short note that the
association should supply their own photos from Offenbacher Woche and Lichterfest —
they own those, and one good photo of a full Innenstadt does more here than any
graphic we can generate.

═══════════════════════════════════════════════════════════════════════
4. THE MEMBER LIST MAY ALREADY EXIST — go and look
═══════════════════════════════════════════════════════════════════════
The association's older site at treffpunkt-of.de reportedly carries a list of member
businesses. I could not reach it to check. It is the client's own site, so fetch it
and look properly: the homepage, every navigation link, and any page whose name
suggests Mitglieder / Mitgliederliste / Unsere Betriebe / Partner.

If you find a list:
- extract it into data/members.json using the schema already in lib/members.ts,
  filling only the fields the old site actually states — name, Branche, street.
  Everything else stays undefined and must render gracefully, which you already built.
- remove the _note TODO-COPY marker so MEMBERS_ARE_PLACEHOLDER goes false and the
  directory goes live with real businesses.
- run the geocoder for the new addresses.
- show me the extracted list before you commit it. These are real businesses; I want
  to see the names against the source before they appear on a live site.

If you do not find one, say so plainly, leave the guard in place, and move on. Do not
invent entries and do not keep the current placeholders one line longer than needed.

═══════════════════════════════════════════════════════════════════════
5. NEW HEADLINE — more conservative
═══════════════════════════════════════════════════════════════════════
"Der Treffpunkt für alle, die in Offenbach etwas aufbauen" is too much like a startup
slogan for a Gewerbeverein whose members have run shops for twenty years. Replace it
with this, as h1:

  "Der Gewerbeverein für Handel, Handwerk und Dienstleistung in Offenbach."

and this as the lead line beneath it:

  "Gemeinsam für eine lebendige Innenstadt — seit vielen Jahren die Stimme der
   Betriebe gegenüber Stadt und Öffentlichkeit."

Two alternates if that reads too dry when you see it in place; use one of these
instead and tell me which you picked and why:
  A) "Wir vertreten die Betriebe der Offenbacher Innenstadt."
  B) "Gemeinsam für eine lebendige Offenbacher Innenstadt."

Note on the lead: "seit vielen Jahren" is defensible — the Offenbacher Woche ran for
the 28th time in 2026 — but do not put a founding year or a member count anywhere,
those are still unknown. The h1 is also the better SEO string: it names the three
member categories and the city, which is what someone actually searches for.

═══════════════════════════════════════════════════════════════════════
6. MORE ANIMATION — but the same discipline
═══════════════════════════════════════════════════════════════════════
Add exactly these. Everything is wrapped so prefers-reduced-motion removes the
movement, everything animated keeps data-reveal so the noscript fallback holds, and
nothing may delay the LCP element.

- Hero: headline in a per-line reveal (clip-path or a masked y-translate, 0.6s,
  90ms between lines), lead and buttons following at +0.15s. The logo draw already
  exists; sequence the text to start as the ring finishes so it reads as one move.
- Nav: the active-page indicator animates between items with a shared layout
  transition rather than snapping.
- Kennzahlen: the count-up exists; add a thin --c-accent rule under each number that
  draws left-to-right as its number counts.
- Cards: on hover, the 1px border shifts to --c-accent over 180ms and the card lifts
  1px. No shadow, no scale.
- Buttons: keep the 120ms colour transition, add a 2px accent underline that grows
  from the left on the outline variant.
- Section headings: reveal one beat before their body content, not simultaneously.
- Radar list items: stagger in at 50ms, and the category chip fades its background
  in slightly after the text.
- Scroll progress: a 2px --c-accent line at the very top of the viewport, driven by
  scroll position. This is the one ambient effect allowed.
- Page transitions: View Transitions API where supported, no fallback needed.

Still forbidden, and I mean it: parallax, scroll-jacking, 3D, particle fields,
animated gradient meshes, anything that moves without being scrolled or hovered,
and any effect that plays more than once per page load.

═══════════════════════════════════════════════════════════════════════
7. FINISH THE RADAR MODULE — file-based, still no database
═══════════════════════════════════════════════════════════════════════
Build the full public experience on top of data/radar.json. No Neon, no admin, no
classifier, no cron — those stay parked. The point is that the module is complete and
useful the moment real items exist; the automation is a later optimisation, not a
prerequisite.

- /radar: full list, dense, not a blog. Mono date, category chip, headline in Archivo
  600, summary in Newsreader, the "Was das für Sie heißt" line in a tinted box,
  source name and date linking out. urgency:high gets a 3px --c-signal rule on the left.
- Category filter chips for the six rubrics, state in searchParams so a filtered view
  is shareable and indexable. Add "Alle" and a reset.
- "Für mich relevant" toggle reading a Branche + Straße profile from localStorage,
  wrapped in try/catch, no account, no cookie. When on, items whose audience or
  streets match the profile sort to the top and the rest dim slightly — filter by
  relevance, don't hide.
- /radar/[slug] per item, generated from the JSON, with its own metadata.
- Items with a deadline: "noch N Tage" in tabular-nums, --c-signal when under 14 days,
  plus an .ics download reusing lib/ics.ts. Compute the countdown on the client so it
  can't be baked stale into a static page.
- frequenz items also render on a horizontal 12-week timeline pinned above the list.
- /radar/feed.xml so members can subscribe in their own reader.
- The RADAR_ITEMS_ARE_PLACEHOLDER guard stays and stays true while the file holds
  only specimens. Everything above must be verifiable with the guard off in dev and
  correctly hidden with it on — test both states.
- README: a short section on how to add a real item, written for someone who is not a
  developer. Edit the JSON, commit, done.

═══════════════════════════════════════════════════════════════════════
FINISHING
═══════════════════════════════════════════════════════════════════════
- Update /styleguide to the new palette so it stays the reference.
- Run the Playwright suite in both themes at 1360 and 420. Fix what's red.
- Lighthouse once on the production build; report the four numbers. Accessibility
  must stay 100 — the palette change is the likeliest thing to break it, so check
  contrast on buttons, chips and the tinted boxes specifically.
- Deploy: `npx vercel --prod --token $TOKEN` reading the token from .env.deploy.
  Verify the live URL afterwards — routes 200, /admin 404, both themes, guards still
  active where they should be — and report what you actually got.
- Commit after each numbered section.

STANDING RULES, unchanged:
- Never invent facts. Still unknown: founding year, Vereinsregister number, member
  count, fees, and every event date except Offenbacher Woche 2026 (28.–31. Mai, 28th).
- Colour only through tokens, never a literal, in either theme.
- Hairline borders, no shadows, no radius except pills. Archivo display, Newsreader
  text, Plex Mono data, tabular-nums on numbers.
- Ask before adding a dependency.
```
