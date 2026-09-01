import Image from "next/image";
import Link from "next/link";
import { Button, Card, Chip, Container, Eyebrow, Heading, Lead, Section } from "@/components/ui";
import { LogoMark } from "@/components/Logo";
import { BrandBackdrop } from "@/components/BrandBackdrop";
import { CountUp, Reveal } from "@/components/motion";
import { KENNZAHLEN } from "@/data/verein";
import { LEISTUNGEN } from "@/data/content";
import { MEMBERS_ARE_PLACEHOLDER, getAllMembers } from "@/lib/members";
import { getNextConfirmedEvent } from "@/lib/events";
import { RADAR_CATEGORIES, RADAR_ITEMS_ARE_PLACEHOLDER, getRadarItems } from "@/lib/radar-content";
import { getHeroImagePath } from "@/lib/hero-image";

const members = getAllMembers();

export default function Home() {
  const next = getNextConfirmedEvent();
  const radar = RADAR_ITEMS_ARE_PLACEHOLDER ? [] : getRadarItems().slice(0, 3);
  const heroImage = getHeroImagePath();

  return (
    <>
      {/* ---------------------------------------------------- 1. Hero */}
      <header className="relative overflow-hidden bg-paper">
        {heroImage ? (
          <>
            <Image
              src={heroImage}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
              aria-hidden="true"
            />
            <div className="absolute inset-0" style={{ backgroundColor: "var(--c-ink)", opacity: 0.55 }} aria-hidden="true" />
          </>
        ) : (
          <BrandBackdrop />
        )}
        <Container className="relative z-10">
          <div className="grid items-center gap-12 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24">
            <div>
              <Eyebrow className="mb-6">Gewerbeverein · Offenbach am Main</Eyebrow>
              <Heading level={1}>
                Der Gewerbeverein für Handel, Handwerk und Dienstleistung in Offenbach.
              </Heading>
              <Lead className="mt-7 max-w-[46ch]">
                Gemeinsam für eine lebendige Innenstadt — seit vielen Jahren die Stimme der Betriebe gegenüber
                Stadt und Öffentlichkeit.
              </Lead>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button href="/mitglied-werden">Mitglied werden</Button>
                <Button href="/radar" variant="outline">
                  OF-Radar ansehen
                </Button>
              </div>
            </div>

            <div
              className="flex aspect-square w-full max-w-[400px] items-center justify-center justify-self-center border"
              style={{ borderColor: "var(--c-line)", backgroundColor: "var(--c-paper-2)" }}
            >
              <LogoMark size={230} animated />
            </div>
          </div>
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
        <Eyebrow className="mb-4">Was wir machen</Eyebrow>
        <Heading className="max-w-[16ch]">Frequenz, Nachbarn, Einfluss.</Heading>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {LEISTUNGEN.map((l, i) => (
            <Reveal key={l.title} delay={i * 0.06}>
              <Card className="h-full">
                <h3 className="font-display text-[17px] font-semibold">{l.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{l.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------- 4. OF-Radar teaser */}
      <Section tone="paper-2">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow className="mb-4">OF-Radar</Eyebrow>
            <Heading className="max-w-[20ch]">Was diese Woche Ihr Geschäft betrifft.</Heading>
            <p className="prose-body mt-5 text-[16px]">
              Keine Stadtnachrichten, sondern ein Filter mit einer einzigen Frage: ändert das etwas für
              einen Betrieb in Offenbach? Sechs Rubriken, jede Meldung mit Quelle, Datum und einem Satz
              dazu, was jetzt zu tun ist.
            </p>
          </div>
          <Button href="/radar" variant="outline">
            Alle Meldungen
          </Button>
        </div>

        {radar.length > 0 ? (
          <ul className="mt-12 flex flex-col">
            {radar.map((item, i) => {
              const cat = RADAR_CATEGORIES[item.category];
              return (
                <Reveal key={item.slug} delay={i * 0.06}>
                  <li
                    className="border-t py-6"
                    style={{
                      borderColor: "var(--c-line)",
                      borderLeft: item.urgency === "high" ? "3px solid var(--c-accent)" : undefined,
                      paddingLeft: item.urgency === "high" ? "18px" : undefined,
                    }}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <time className="font-mono text-[11px] tracking-[0.08em] text-muted" dateTime={item.date}>
                        {formatDate(item.date)}
                      </time>
                      <Chip tone={cat.tone}>{cat.label}</Chip>
                    </div>
                    <h3 className="mt-3 max-w-[52ch] font-display text-[19px] font-semibold leading-snug">
                      <Link href={`/radar#${item.slug}`} className="link-underline">
                        {item.headline}
                      </Link>
                    </h3>
                    <p className="prose-body mt-2 text-[15px]">{item.summary}</p>
                    <p
                      className="mt-3 inline-block px-3 py-2 text-[14px]"
                      style={{ background: "var(--c-accent-soft)", color: "var(--c-accent)" }}
                    >
                      <span className="font-display font-semibold">Was das heißt: </span>
                      {item.action}
                    </p>
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                      Quelle: {item.sourceName}
                    </p>
                  </li>
                </Reveal>
              );
            })}
          </ul>
        ) : (
          <p className="prose-body mt-12 max-w-[52ch]">
            Der OF-Radar startet in Kürze. Meldungen erscheinen hier erst nach redaktioneller Prüfung und Freigabe
            im Vorstand — nichts wird automatisch veröffentlicht.
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
        <Eyebrow className="mb-4">Veranstaltungen</Eyebrow>
        <Reveal>
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
            <Heading className="max-w-[18ch]" >Alleine ist die Innenstadt schwer zu bewegen.</Heading>
            <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed" style={{ color: "var(--c-invert-fg)", opacity: 0.85 }}>
              Mitglied werden heißt: bei den Formaten mitreden, die Frequenz bringen, die Nachbarn kennen
              und die Meldungen bekommen, bevor sie zum Problem werden.
            </p>
          </div>
          <Button href="/mitglied-werden">Jetzt Mitglied werden</Button>
        </div>
      </Section>
    </>
  );
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}
