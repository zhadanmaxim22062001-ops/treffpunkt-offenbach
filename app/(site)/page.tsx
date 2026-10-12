import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";
import { Button, Card, Chip, Container, Eyebrow, Heading, Lead, Section } from "@/components/ui";
import { RadarItemDate, RadarSourceLabel } from "@/components/RadarItemDate";
import { HeroDot } from "@/components/Logo";
import { HeroLogo } from "@/components/HeroLogo";
import { BrandBackdrop } from "@/components/BrandBackdrop";
import { CountUp, LineReveal, MountReveal, Reveal } from "@/components/motion";
import { KENNZAHLEN } from "@/data/verein";
import { LEISTUNGEN } from "@/data/content";
import { MEMBERS_ARE_PLACEHOLDER, getAllMembers } from "@/lib/members";
import { getNextConfirmedEvent } from "@/lib/events";
import { RADAR_ITEMS_ARE_PLACEHOLDER, RADAR_CATEGORIES, getVisibleBusinessItems } from "@/lib/radar-content";
import { getCalendarEntries } from "@/lib/calendar";
import { CalendarPreview } from "@/components/CalendarPreview";
import { getHeroImagePath } from "@/lib/hero-image";
import { HERO_PHOTO_CREDIT, isMediaCreditComplete } from "@/data/media";

const members = getAllMembers();

// The headline starts revealing a beat after the hero dot begins its 420ms
// fade-in (.hero-dot in globals.css) — they finish together, neither waits on
// the other. (This used to be 0.85s, timed to the retired mark's ring-draw
// animation; nothing is drawn on any more, so nothing to wait for.)
const HERO_TEXT_DELAY = 0.15;

// This page is otherwise fully static, but the radar teaser and calendar
// preview both depend on "today" (item aging, event dates) — an hourly
// revalidation keeps that honest without making the whole homepage
// server-rendered per request. See lib/radar-content.ts's
// isRadarItemVisible for why this can't just be baked in at build time.
export const revalidate = 3600;

export default function Home() {
  const next = getNextConfirmedEvent();
  const today = new Date().toISOString().slice(0, 10);
  const radar = RADAR_ITEMS_ARE_PLACEHOLDER ? [] : getVisibleBusinessItems(today).slice(0, 3);
  const calendarEntries = getCalendarEntries();
  const heroImage = getHeroImagePath();

  return (
    <>
      {/* ---------------------------------------------------- 1. Hero */}
      {/* Reverted to the full-bleed-photo-plus-directional-gradient
          version — the split navy-panel/photo layout that briefly
          replaced it was wrong (and, on the deployed build, the photo
          column wasn't rendering at all). Photo across the whole hero,
          headline over it, darkness concentrated behind the text and
          fading open toward the right so the city shows through — no
          hard edges anywhere, one soft transition. See .hero-scrim in
          globals.css. */}
      <header
        className={clsx("relative overflow-hidden", !heroImage && "bg-paper")}
        // Fits the viewport it's actually in, not a fixed guess: 100svh (not
        // vh — vh includes a mobile browser's collapsing address bar, which
        // would make the hero jump height as the visitor scrolls) minus the
        // sticky nav's own height (--header-h in globals.css, set by the logo size). Floored at
        // 560px so it doesn't collapse on a short window, capped at 860px so
        // it doesn't become absurd on a tall monitor. Without this, the
        // hero's height was purely content-driven and taller than most
        // viewports — the mark, anchored near its bottom, ended up below the
        // fold on first load; scrolling down ~90px (past the now-nonexistent
        // extra height) was the only way to see all of it.
        style={heroImage ? { height: "clamp(560px, calc(100svh - var(--header-h)), 860px)" } : undefined}
      >
        {heroImage ? (
          <>
            {/* Full-bleed photo. object-position moved down from the photo's
                centre (which was mostly empty sky in this wide aerial shot)
                to bias toward the skyline band instead — tuned by eye at
                every required width; see the commit message for the exact
                value settled on. Mobile (<md) keeps its own separate crop
                (20%) — that layout stacks full-width with the vertical
                scrim and wasn't part of the reported problem. */}
            <Image
              src={heroImage}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-[center_20%] md:object-[50%_65%]"
              aria-hidden="true"
            />
            {/* Directional scrim, not a flat overlay — see .hero-scrim in
                globals.css. Darkness sits where the headline/lead/buttons
                and the credit line actually are; the rest of the photo (the
                skyline, the river) opens up instead of sitting under a flat
                dark wash. */}
            <div className="hero-scrim absolute inset-0" aria-hidden="true" />
            {/* The logo, TREFF ● PUNKT (logo-compact-inverse, no shadow — the cast
                shadow turns the halo grey on a photo). Its right edge ALIGNS
                with the content column's right gutter (the same container the
                headline hangs from on the left) — an alignment, not a bleed, so
                the T of PUNKT is never cut. Vertically centred at 72% of the
                hero (level with the lead paragraph; higher puts the white letters
                on bright buildings — see .hero-logo-slot in globals.css). Sized in container-query units of the full-width slot
                (cqw = % of the hero's width); see .hero-logo-box in globals.css
                for the per-breakpoint widths and the clear-space rule they obey.
                Positioned by the outer boxes (pure layout, no animation) so the
                inner logo can fade in and pulse without fighting it. Hidden below
                md as before: the brand is already in the header on a phone, and
                a large decorative logo would crowd the headline there (see the
                README's Logo section). */}
            <div className="hero-logo-slot pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
              <div className="relative mx-auto h-full w-full max-w-[1180px] px-6">
                <div className="hero-logo-box">
                  <HeroLogo className="hero-dot" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <BrandBackdrop />
        )}
        <Container className="relative z-10">
          {/* py-24 (md+) was sized for a content-driven, taller-than-any-
              viewport hero; now that the header itself is height-clamped to
              the real viewport, that much padding pushed the credit line
              (which sits after this grid, still inside Container) below
              900px at 1360x900. Trimmed to py-14 — measured to bring credit
              back within the fold, see the commit message for the exact
              numbers. */}
          <div
            className={clsx(
              "grid items-center gap-12 py-16",
              heroImage ? "md:py-14" : "md:py-24 md:grid-cols-[1.1fr_0.9fr]",
            )}
          >
            <div className={heroImage ? "max-w-[540px]" : undefined}>
              <Eyebrow className="mb-6" style={heroImage ? { color: "var(--c-hero-ink)", opacity: 0.9 } : undefined}>
                Gewerbeverein · Offenbach am Main
              </Eyebrow>
              <Heading
                level={1}
                ariaLabel="Der Gewerbeverein für Handel, Handwerk und Dienstleistung in Offenbach."
                // Back to the shared Heading clamp (clamp(38px,6.2vw,68px),
                // components/ui.tsx) — no hero-specific override. A three-
                // line cap once shrank this to clamp(28px,4vw,36px); four
                // lines at desktop is fine, so that override is gone. The
                // vertical-fit requirement (eyebrow/h1/lead/buttons visible
                // at 1360x900 without scrolling) is met by the hero's own
                // padding instead — see the reduced py-14/md:py-20 below.
                style={heroImage ? { color: "var(--c-hero-ink)" } : undefined}
              >
                <LineReveal
                  delay={HERO_TEXT_DELAY}
                  lines={["Der Gewerbeverein für Handel,", "Handwerk und Dienstleistung", "in Offenbach."]}
                />
              </Heading>
              <MountReveal delay={HERO_TEXT_DELAY + 0.15}>
                <Lead
                  className="mt-7 max-w-[46ch]"
                  style={heroImage ? { color: "var(--c-hero-ink)", opacity: 0.95 } : undefined}
                >
                  Gemeinsam für eine lebendige Innenstadt — seit vielen Jahren die Stimme der Betriebe gegenüber
                  Stadt und Öffentlichkeit.
                </Lead>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Button href="/mitglied-werden" onPhoto={!!heroImage}>
                    Mitglied werden
                  </Button>
                  <Button href="/radar" variant="outline" onPhoto={!!heroImage}>
                    OF-Radar ansehen
                  </Button>
                </div>
              </MountReveal>
            </div>

            {!heroImage && (
              <div
                className="flex aspect-square w-full max-w-[400px] items-center justify-center justify-self-center border"
                style={{ borderColor: "var(--c-line)", backgroundColor: "var(--c-paper-2)" }}
              >
                <HeroDot className="hero-dot" style={{ width: 230, height: 230 }} />
              </div>
            )}
          </div>
          {/* Quiet by design — a line nobody is meant to read, not a
              caption. Still carries every element CC BY-SA 4.0 requires
              (author, licence, a link, in this "reasonable manner for the
              medium"): the author's name links to the Commons file page,
              the licence name links to the deed. The full record —
              including the required note on what was changed — lives in
              /impressum's Bildnachweise; this line doesn't repeat it.
              Bottom LEFT now (was bottom-right, where it sat on top of the
              mark — ugly and, post gradient-pull-in, unreadable): same
              gutter as the headline/buttons above it, no extra alignment
              class needed since it's a direct Container child same as
              that column. Sits in normal flow after the grid (not
              absolutely positioned), so it can never collide with the
              buttons above it at any width, wrapped or not — it just
              pushes the header a little taller, which the photo/gradient/
              mark behind it (all absolute inset-0 / positioned off
              explicit percentages) stretch to cover automatically. Gated
              on the same isMediaCreditComplete() as the photo itself —
              that guard doesn't move; only the position did. */}
          {heroImage && isMediaCreditComplete(HERO_PHOTO_CREDIT) && (
            <p className="hero-credit pb-6 md:pb-8">
              Foto:{" "}
              <a href={HERO_PHOTO_CREDIT.filePageUrl} target="_blank" rel="noopener noreferrer">
                {HERO_PHOTO_CREDIT.author}
              </a>
              {" · "}
              <a href={HERO_PHOTO_CREDIT.licenceUrl} target="_blank" rel="noopener noreferrer">
                {HERO_PHOTO_CREDIT.licenceName}
              </a>
            </p>
          )}
        </Container>
      </header>

      {/* ---------------------------------------------- 2. Kennzahlen */}
      <Section tone="paper-2">
        {/* Not a <dl>: each item is a (number, label, note) triple, not a
            term/definition pair, and axe's definition-list check is right
            to reject that regardless of how it's marked up — plain divs
            with visual styling are the honest structure here. */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {KENNZAHLEN.map((k, i) => (
            <Reveal key={k.label} delay={i * 0.06}>
              <div>
                <p className="font-display text-[clamp(40px,5vw,60px)] font-extrabold leading-none tracking-[-0.04em] text-accent">
                  <CountUp to={k.value} suffix={k.suffix} />
                </p>
                <p className="mt-3 font-display text-[15px] font-semibold">{k.label}</p>
                <p className="mt-1 text-[14px] leading-snug text-muted">{k.note}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------- 3. Was wir machen */}
      <Section>
        <Reveal>
          <Eyebrow className="mb-4">Was wir machen</Eyebrow>
          <Heading className="max-w-[16ch]">Frequenz, Nachbarn, Einfluss.</Heading>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {LEISTUNGEN.map((l, i) => (
            <Reveal key={l.title} delay={0.1 + i * 0.06}>
              <Card className="h-full">
                <h3 className="font-display text-[17px] font-semibold">{l.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{l.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1 + LEISTUNGEN.length * 0.06}>
          <div className="mt-10 max-w-[52ch]">
            <p className="eyebrow mb-2">Der Verein über sich selbst</p>
            <blockquote
              className="border-l-2 pl-5 font-display text-[17px] italic leading-snug text-ink-2"
              style={{ borderColor: "var(--c-accent)" }}
            >
              „In Offenbach sind alle relevanten Kaufhäuser und Gastronomen Mitglieder des Treffpunkt Offenbach.“
            </blockquote>
          </div>
        </Reveal>
      </Section>

      {/* ------------------------------------------- 4. OF-Radar teaser */}
      <Section tone="paper-2">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow className="mb-4">OF-Radar</Eyebrow>
              <Heading className="max-w-[24ch]">Was in der Stadt los ist.</Heading>
              <p className="prose-body mt-5 text-[16px]">
                Zuerst der Kalender: alles, was Menschen in die Innenstadt bringt. Und was sonst Ihr
                Geschäft betrifft — geprüft, mit Quelle und Datum.
              </p>
            </div>
            <Button href="/radar" variant="outline">
              Zum OF-Radar
            </Button>
          </div>
        </Reveal>

        <CalendarPreview entries={calendarEntries} limit={4} />

        {radar.length > 0 && (
          <Reveal delay={0.12}>
            <p className="eyebrow mt-12">Und was sonst Ihr Geschäft betrifft</p>
          </Reveal>
        )}

        {radar.length > 0 ? (
          <ul className="mt-6 flex flex-col">
            {radar.map((item, i) => {
              const cat = RADAR_CATEGORIES[item.category];
              return (
                <Reveal
                  as="li"
                  key={item.slug}
                  delay={0.1 + i * 0.06}
                  className="block border-t py-6"
                  style={{
                    borderColor: "var(--c-line)",
                    borderLeft: item.urgency === "high" ? "3px solid var(--c-signal)" : undefined,
                    paddingLeft: item.urgency === "high" ? "18px" : undefined,
                  }}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <RadarItemDate item={item} className="font-mono text-[11px] tracking-[0.08em] text-muted" />
                    <Chip tone={cat.tone}>{cat.label}</Chip>
                  </div>
                  <h3 className="mt-3 max-w-[52ch] font-display text-[19px] font-semibold leading-snug">
                    <Link href={`/radar/${item.slug}`} className="link-underline">
                      {item.headline}
                    </Link>
                  </h3>
                  <p className="prose-body mt-2 text-[15px]">{item.summary}</p>
                  <p
                    className="mt-3 inline-block px-3 py-2 text-[14px]"
                    style={{ background: "var(--c-accent-soft)", color: "var(--c-accent)" }}
                  >
                    <span className="font-display font-semibold">Was das für Sie heißt: </span>
                    {item.action}
                  </p>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                    Quelle: <RadarSourceLabel item={item} />
                  </p>
                </Reveal>
              );
            })}
          </ul>
        ) : (
          <p className="prose-body mt-12 max-w-[52ch]">
            {calendarEntries.length > 0
              ? "Über den Kalender hinaus zeigt der OF-Radar noch keine geprüften Meldungen zu Rathaus, Baustellen, Förderung, Stadtentwicklung oder Recht."
              : "Der OF-Radar startet in Kürze. Meldungen erscheinen hier erst nach redaktioneller Prüfung und Freigabe im Vorstand — nichts wird automatisch veröffentlicht."}
          </p>
        )}
      </Section>

      {/* ------------------------------------------ 5. Mitglieder-Marquee */}
      {/* Hidden while the member list is still placeholders — see lib/members.ts MEMBERS_ARE_PLACEHOLDER. */}
      {!MEMBERS_ARE_PLACEHOLDER && (
        <section className="border-t py-14" style={{ borderColor: "var(--c-line)" }}>
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <Eyebrow>Unsere Mitglieder</Eyebrow>
              <Link href="/mitglieder" className="link-underline font-display text-[14px] font-medium">
                Zum Verzeichnis
              </Link>
            </div>
          </Container>
          <div className="marquee mt-8 overflow-hidden" aria-label="Mitgliedsbetriebe">
            <div className="marquee-track flex w-max gap-3">
              {[...members, ...members].map((m, i) => (
                <Link
                  key={`${m.slug}-${i}`}
                  href={`/mitglieder/${m.slug}`}
                  aria-hidden={i >= members.length}
                  tabIndex={i >= members.length ? -1 : 0}
                  className="shrink-0 border px-5 py-3 font-display text-[15px] font-medium transition-colors duration-[120ms] hover:text-accent"
                  style={{ borderColor: "var(--c-line)", backgroundColor: "var(--c-paper-2)" }}
                >
                  {m.name}
                  <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                    {m.branche}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --------------------------------------- 6. Nächste Veranstaltung */}
      {/* Only ever shows a specific date once lib/events.ts confirms one exists — see data/content.ts for why. */}
      <Section tone="paper-2">
        <Reveal>
          <Eyebrow className="mb-4">Veranstaltungen</Eyebrow>
        </Reveal>
        <Reveal delay={0.1}>
          {next ? (
            <article
              className="grid gap-8 border p-8 md:grid-cols-[auto_1fr] md:p-12"
              style={{ borderColor: "var(--c-accent)", backgroundColor: "var(--c-paper)" }}
            >
              <p className="font-display text-[clamp(30px,4vw,44px)] font-extrabold leading-none tracking-[-0.035em] text-accent tnum">
                {next.when}
              </p>
              <div>
                <h3 className="font-display text-[clamp(22px,2.6vw,30px)] font-extrabold tracking-[-0.03em]">
                  {next.title}
                </h3>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">{next.place}</p>
                <p className="prose-body mt-4">{next.summary}</p>
                <Link
                  href={`/veranstaltungen/${next.slug}`}
                  className="link-underline mt-5 inline-block font-display text-[14px] font-semibold"
                >
                  Alle Veranstaltungen
                </Link>
              </div>
            </article>
          ) : (
            <article className="border p-8 md:p-12" style={{ borderColor: "var(--c-line)", backgroundColor: "var(--c-paper)" }}>
              <h3 className="font-display text-[clamp(22px,2.6vw,30px)] font-extrabold tracking-[-0.03em]">
                Die Termine für 2027 stehen noch nicht fest.
              </h3>
              <p className="prose-body mt-4">
                Offenbacher Woche, Lichterfest, verkaufsoffene Sonntage: Sobald der Vorstand die Termine bestätigt,
                erscheinen sie hier und im Veranstaltungskalender.
              </p>
              <Link href="/veranstaltungen" className="link-underline mt-5 inline-block font-display text-[14px] font-semibold">
                Alle Veranstaltungen
              </Link>
            </article>
          )}
        </Reveal>
      </Section>

      {/* ----------------------------------------------- 7. Schluss-CTA */}
      <Section tone="invert" backdrop={<BrandBackdrop inverse />}>
        <div className="grid items-center gap-10 md:grid-cols-[1.2fr_auto]">
          <div>
            <Reveal>
              <Heading className="max-w-[18ch]">Alleine ist die Innenstadt schwer zu bewegen.</Heading>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed" style={{ color: "var(--c-invert-fg)", opacity: 0.85 }}>
                Mitglied werden heißt: bei den Formaten mitreden, die Frequenz bringen, die Nachbarn kennen
                und die Meldungen bekommen, bevor sie zum Problem werden.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <Button href="/mitglied-werden">Jetzt Mitglied werden</Button>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
