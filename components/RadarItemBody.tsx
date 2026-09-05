import Link from "next/link";
import { Chip } from "@/components/ui";
import { RadarDeadline } from "@/components/RadarDeadline";
import { RADAR_CATEGORIES, type RadarItem } from "@/lib/radar-content";

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

/**
 * A single OF-Radar item's full rendering — date, category chip, headline
 * link, summary, the "Was das für Sie heißt" box (only when set: an
 * automatically-published frequenz entry never gets one), the deadline
 * countdown, and the sourced link. Extracted from components/RadarList.tsx
 * so the OF-Radar month calendar's selected-day panel (components/
 * RadarCalendarWidget.tsx) can show a frequenz entry exactly the way the
 * business list already shows every other item, rather than a second,
 * slightly-different implementation of the same block. `chipFadeDelay` is
 * the list's own staggered chip-fade-in timing — omit it for a single item
 * shown on its own, where there's nothing to stagger against.
 */
export function RadarItemBody({ item, chipFadeDelay }: { item: RadarItem; chipFadeDelay?: number }) {
  const cat = RADAR_CATEGORIES[item.category];
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <time className="font-mono text-[11px] tracking-[0.08em] text-muted tnum" dateTime={item.date}>
          {formatDate(item.date)}
        </time>
        <Chip tone={cat.tone}>
          {chipFadeDelay !== undefined ? (
            <span className="chip-fade-in inline-block" style={{ animationDelay: `${chipFadeDelay}s` }}>
              {cat.label}
            </span>
          ) : (
            cat.label
          )}
        </Chip>
      </div>
      <h2 className="mt-3 max-w-[60ch] font-display text-[19px] font-semibold leading-snug">
        <Link href={`/radar/${item.slug}`} className="link-underline">
          {item.headline}
        </Link>
      </h2>
      <p className="prose-body mt-2 text-[15px]">{item.summary}</p>
      {item.action && (
        <p
          className="mt-3 inline-block px-3 py-2 text-[14px]"
          style={{ background: "var(--c-accent-soft)", color: "var(--c-accent)" }}
        >
          <span className="font-display font-semibold">Was das für Sie heißt: </span>
          {item.action}
        </p>
      )}
      {item.deadline && (
        <RadarDeadline slug={item.slug} headline={item.headline} summary={item.summary} deadline={item.deadline} />
      )}
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
        Quelle:{" "}
        <a href={item.sourceUrl} className="link-underline" target="_blank" rel="noopener noreferrer">
          {item.sourceName} · {formatDate(item.date)}
        </a>
      </p>
    </>
  );
}
