import Link from "next/link";
import type { Metadata } from "next";
import { Eyebrow, Heading, Lead, Rule, Section } from "@/components/ui";
import { RadarList } from "@/components/RadarList";
import { RadarDayRow } from "@/components/RadarDayRow";
import {
  RADAR_CATEGORIES,
  RADAR_BUSINESS_CATEGORY_LIST,
  RADAR_ITEMS_ARE_PLACEHOLDER,
  getVisibleBusinessItems,
  type RadarCategory,
} from "@/lib/radar-content";
import { defaultWindowSelection, getCalendarEntries } from "@/lib/calendar";
import { addDays, addMonths, compareDates, todayBerlin, toIso } from "@/lib/date-berlin";

export const metadata: Metadata = {
  title: "OF-Radar",
  description:
    "Der Innenstadt-Kalender und was Betriebe sonst betrifft — geprüft, mit Quelle und Datum.",
  alternates: { types: { "application/rss+xml": "/radar/feed.xml" } },
};

type SearchParams = { kategorie?: string; ab?: string };

function buildHref(kategorie?: string): string {
  return kategorie ? `/radar?kategorie=${encodeURIComponent(kategorie)}` : "/radar";
}

const WINDOW_START_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTHS_BACK = 12;
const MONTHS_FORWARD = 24;

/** Parses ?ab=YYYY-MM-DD, clamped to the 12-months-back/24-forward browsing
 *  range — a malformed, invalid, or out-of-range value falls back to today
 *  rather than erroring, same spirit as every other guard in this project:
 *  an honest default, not a broken page. */
function resolveWindowStart(raw: string | undefined, today: ReturnType<typeof todayBerlin>) {
  const match = raw?.match(WINDOW_START_RE);
  if (!match) return today;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (m < 1 || m > 12) return today;
  const candidate = { y, m, d };
  // Round-tripping through toIso/parseIso would just re-parse the same
  // numbers — the real validity check is that addDays(candidate, 0) lands
  // back on itself; an impossible date like 2026-02-30 doesn't.
  if (toIso(candidate) !== toIso(addDays(candidate, 0))) return today;
  const minStart = addMonths(today, -MONTHS_BACK);
  const maxStart = addMonths(today, MONTHS_FORWARD);
  if (compareDates(candidate, minStart) < 0 || compareDates(candidate, maxStart) > 0) return today;
  return candidate;
}

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const activeCategory = RADAR_BUSINESS_CATEGORY_LIST.includes(sp.kategorie as RadarCategory)
    ? (sp.kategorie as RadarCategory)
    : undefined;

  const calendarEntries = getCalendarEntries();

  // Computed fresh per request — this route is already dynamic (the
  // searchParams-driven filter forces that), so "today" here is never
  // baked into a static build. Europe/Berlin explicitly, not the server
  // process's own time zone — see lib/date-berlin.ts.
  const todayDate = todayBerlin();
  const todayIso = toIso(todayDate);
  const windowStart = resolveWindowStart(sp.ab, todayDate);
  const windowDays = Array.from({ length: 10 }, (_, i) => addDays(windowStart, i));
  const initialSelectedIso = defaultWindowSelection(calendarEntries, windowDays, todayIso);

  const allBusinessItems = RADAR_ITEMS_ARE_PLACEHOLDER ? [] : getVisibleBusinessItems(todayIso);
  const items = activeCategory ? allBusinessItems.filter((item) => item.category === activeCategory) : allBusinessItems;

  return (
    <Section>
      <Eyebrow className="mb-4">OF-Radar</Eyebrow>
      <Heading level={1} className="max-w-[24ch]">
        Was in der Stadt los ist.
      </Heading>
      <Lead className="mt-6 max-w-[60ch]">
        Zuerst der Kalender: alles, was Menschen in die Innenstadt bringt — Vereins-Termine und Markttermine in einer
        Ansicht. Und was sonst Ihr Geschäft betrifft: geprüft, mit Quelle und Datum, von Hand zusammengestellt.
      </Lead>

      <p className="mt-8">
        <a href="/radar/feed.xml" className="link-underline font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
          Als RSS-Feed abonnieren
        </a>
      </p>

      <div className="mt-10">
        <p className="eyebrow mb-6">Innenstadt-Kalender</p>
        <RadarDayRow
          entries={calendarEntries}
          initialWindowStartIso={toIso(windowStart)}
          todayIso={todayIso}
          initialSelectedIso={initialSelectedIso}
          basePath="/radar"
        />
      </div>

      <div className="mt-16">
        <Heading level={2} className="max-w-[28ch]">
          Und was sonst Ihr Geschäft betrifft.
        </Heading>

        {RADAR_ITEMS_ARE_PLACEHOLDER ? (
          <p className="prose-body mt-6 max-w-[60ch] text-[15px] text-muted">
            Diese Liste zeigt noch keine Meldungen. Der Kalender oben bleibt davon unabhängig aktuell — sobald
            geprüfte Meldungen zu Rathaus, Baustellen, Förderung, Stadtentwicklung oder Recht freigegeben sind,
            erscheinen sie hier.
          </p>
        ) : (
          <>
            <div className="mt-8 flex flex-wrap items-center gap-2" role="group" aria-label="Nach Rubrik filtern">
              <Link
                href={buildHref(undefined)}
                aria-current={!activeCategory ? "true" : undefined}
                className="border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors duration-[120ms]"
                style={
                  !activeCategory
                    ? { borderColor: "var(--c-accent)", background: "var(--c-accent-soft)", color: "var(--c-accent)" }
                    : { borderColor: "var(--c-line)", color: "var(--c-muted)" }
                }
              >
                Alle
              </Link>
              {RADAR_BUSINESS_CATEGORY_LIST.map((category) => {
                const active = activeCategory === category;
                return (
                  <Link
                    key={category}
                    href={buildHref(active ? undefined : category)}
                    aria-current={active ? "true" : undefined}
                    className="border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors duration-[120ms]"
                    style={
                      active
                        ? { borderColor: "var(--c-accent)", background: "var(--c-accent-soft)", color: "var(--c-accent)" }
                        : { borderColor: "var(--c-line)", color: "var(--c-muted)" }
                    }
                  >
                    {RADAR_CATEGORIES[category].label}
                  </Link>
                );
              })}
              {activeCategory && (
                <Link href="/radar" className="link-underline font-display text-[13px] font-medium text-ink-2">
                  Zurücksetzen
                </Link>
              )}
            </div>

            {items.length === 0 ? (
              <p className="prose-body mt-8 max-w-[52ch]">Keine Meldungen in dieser Rubrik. Filter zurücksetzen und alle ansehen.</p>
            ) : (
              <RadarList items={items} />
            )}
          </>
        )}
      </div>

      <Rule className="mt-16" />
      <div className="mt-8 max-w-[60ch]">
        <p className="eyebrow mb-3">Quellen</p>
        <p className="prose-body text-[13px] text-muted">
          Beobachtet werden aktuell zwei Feeds: die offiziellen Meldungen der Stadt Offenbach (offenbach.de) und das
          Lokalportal OF-News.de. Förderung und Recht haben keinen eigenen Feed und werden vollständig von Hand
          zusammengestellt — deshalb bleiben diese beiden Rubriken die seltensten auf dieser Seite, nicht weil dort
          wenig passiert, sondern weil wir dort nichts automatisiert übernehmen.
        </p>
      </div>
    </Section>
  );
}
