import type { Metadata } from "next";
import { Chip, Eyebrow, Heading, Lead, Section } from "@/components/ui";
import { RADAR_CATEGORIES, RADAR_ITEMS_ARE_PLACEHOLDER, getRadarItems } from "@/lib/radar-content";

export const metadata: Metadata = { title: "OF-Radar" };

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export default function Page() {
  const items = RADAR_ITEMS_ARE_PLACEHOLDER ? [] : getRadarItems();

  return (
    <Section>
      <Eyebrow className="mb-4">OF-Radar</Eyebrow>
      <Heading level={1} className="max-w-[20ch]">
        {items.length > 0 ? "Was Ihr Geschäft betrifft." : "Der OF-Radar startet in Kürze."}
      </Heading>
      <Lead className="mt-6 max-w-[60ch]">
        Meldungen aus Offenbach, gefiltert auf das, was Betriebe betrifft — sechs Rubriken, jede mit Quelle und
        Datum. Nichts wird automatisch veröffentlicht: jede Meldung ist von Hand geprüft.
      </Lead>

      {items.length === 0 ? (
        <p className="prose-body mt-8 max-w-[60ch] text-[15px] text-muted">
          Diese Seite zeigt noch keine Meldungen. Sobald welche freigegeben sind, erscheinen hier ausschließlich
          geprüfte, mit Quelle und Datum versehene Meldungen.
        </p>
      ) : (
        <ul className="mt-12 flex flex-col">
          {items.map((item) => {
            const cat = RADAR_CATEGORIES[item.category];
            return (
              <li
                key={item.slug}
                id={item.slug}
                className="scroll-mt-24 border-t py-6"
                style={{
                  borderColor: "var(--c-line)",
                  borderLeft: item.urgency === "high" ? "3px solid var(--c-accent)" : undefined,
                  paddingLeft: item.urgency === "high" ? "18px" : undefined,
                }}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <time className="font-mono text-[11px] tracking-[0.08em] text-muted tnum" dateTime={item.date}>
                    {formatDate(item.date)}
                  </time>
                  <Chip tone={cat.tone}>{cat.label}</Chip>
                  {item.deadline && (
                    <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-accent tnum">
                      Frist: {formatDate(item.deadline)}
                    </span>
                  )}
                </div>
                <h2 className="mt-3 max-w-[60ch] font-display text-[19px] font-semibold leading-snug">
                  {item.headline}
                </h2>
                <p className="prose-body mt-2 text-[15px]">{item.summary}</p>
                <p
                  className="mt-3 inline-block px-3 py-2 text-[14px]"
                  style={{ background: "var(--c-accent-soft)", color: "var(--c-accent)" }}
                >
                  <span className="font-display font-semibold">Was das heißt: </span>
                  {item.action}
                </p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                  Quelle:{" "}
                  <a href={item.sourceUrl} className="link-underline" target="_blank" rel="noopener noreferrer">
                    {item.sourceName}
                  </a>
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}
