import Link from "next/link";
import type { Metadata } from "next";
import { Eyebrow, Heading, Lead, Rule, Section } from "@/components/ui";
import { RadarList } from "@/components/RadarList";
import { Calendar } from "@/components/Calendar";
import {
  RADAR_CATEGORIES,
  RADAR_BUSINESS_CATEGORY_LIST,
  RADAR_ITEMS_ARE_PLACEHOLDER,
  getRadarItems,
  type RadarCategory,
} from "@/lib/radar-content";
import { getCalendarEntries } from "@/lib/calendar";

export const metadata: Metadata = {
  title: "OF-Radar",
  description:
    "Der Innenstadt-Kalender und was Betriebe sonst betrifft — geprüft, mit Quelle und Datum.",
  alternates: { types: { "application/rss+xml": "/radar/feed.xml" } },
};

type SearchParams = { kategorie?: string };

function buildHref(kategorie?: string): string {
  return kategorie ? `/radar?kategorie=${encodeURIComponent(kategorie)}` : "/radar";
}

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const activeCategory = RADAR_BUSINESS_CATEGORY_LIST.includes(sp.kategorie as RadarCategory)
    ? (sp.kategorie as RadarCategory)
    : undefined;

  const calendarEntries = getCalendarEntries();

  const allBusinessItems = RADAR_ITEMS_ARE_PLACEHOLDER
    ? []
    : getRadarItems().filter((item) => item.category !== "frequenz");
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

      {calendarEntries.length > 0 && (
        <div className="mt-10">
          <Calendar entries={calendarEntries} />
        </div>
      )}

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
