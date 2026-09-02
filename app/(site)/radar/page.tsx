import Link from "next/link";
import type { Metadata } from "next";
import { Eyebrow, Heading, Lead, Section } from "@/components/ui";
import { RadarList } from "@/components/RadarList";
import { RadarTimeline } from "@/components/RadarTimeline";
import { RADAR_CATEGORIES, RADAR_CATEGORY_LIST, RADAR_ITEMS_ARE_PLACEHOLDER, getRadarItems, type RadarCategory } from "@/lib/radar-content";

export const metadata: Metadata = {
  title: "OF-Radar",
  description:
    "Meldungen aus Offenbach, gefiltert auf das, was Betriebe betrifft — sechs Rubriken, jede mit Quelle und Datum.",
  alternates: { types: { "application/rss+xml": "/radar/feed.xml" } },
};

type SearchParams = { kategorie?: string };

function buildHref(kategorie?: string): string {
  return kategorie ? `/radar?kategorie=${encodeURIComponent(kategorie)}` : "/radar";
}

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  if (RADAR_ITEMS_ARE_PLACEHOLDER) {
    return (
      <Section>
        <Eyebrow className="mb-4">OF-Radar</Eyebrow>
        <Heading level={1} className="max-w-[20ch]">
          Der OF-Radar startet in Kürze.
        </Heading>
        <Lead className="mt-6 max-w-[60ch]">
          Diese Seite zeigt noch keine Meldungen. Sobald welche redaktionell geprüft und vom Vorstand freigegeben
          sind, erscheinen hier ausschließlich geprüfte, mit Quelle und Datum versehene Meldungen.
        </Lead>
      </Section>
    );
  }

  const sp = await searchParams;
  const activeCategory = RADAR_CATEGORY_LIST.includes(sp.kategorie as RadarCategory)
    ? (sp.kategorie as RadarCategory)
    : undefined;

  const allItems = getRadarItems();
  const items = activeCategory ? allItems.filter((item) => item.category === activeCategory) : allItems;
  const frequenzItems = allItems.filter((item) => item.category === "frequenz");

  return (
    <Section>
      <Eyebrow className="mb-4">OF-Radar</Eyebrow>
      <Heading level={1} className="max-w-[20ch]">
        Was Ihr Geschäft betrifft.
      </Heading>
      <Lead className="mt-6 max-w-[60ch]">
        Meldungen aus Offenbach, gefiltert auf das, was Betriebe betrifft — sechs Rubriken, jede mit Quelle und
        Datum. Nichts wird automatisch veröffentlicht: jede Meldung ist von Hand geprüft.
      </Lead>

      <p className="mt-8">
        <a href="/radar/feed.xml" className="link-underline font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
          Als RSS-Feed abonnieren
        </a>
      </p>

      {frequenzItems.length > 0 && (
        <div className="mt-10">
          <RadarTimeline items={frequenzItems} />
        </div>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-2" role="group" aria-label="Nach Rubrik filtern">
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
        {RADAR_CATEGORY_LIST.map((category) => {
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
    </Section>
  );
}
