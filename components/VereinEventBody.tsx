import { IcsDownloadButton } from "@/components/IcsDownloadButton";
import { hasConfirmedDate } from "@/lib/events";
import { parseIso, shortGermanDate } from "@/lib/date-berlin";
import type { Event } from "@/data/content";

/**
 * A single association event's full rendering — summary, the confirmed date
 * range (or an honest "not yet confirmed" notice), and the .ics download.
 * Extracted from app/(site)/veranstaltungen/[slug]/page.tsx so the OF-Radar
 * day row's selected-day panel can show a verein-sourced entry with the same
 * block that page already uses, rather than a second implementation of the
 * same date-range-plus-.ics logic. That page keeps its own Eyebrow/H1 around
 * this; `heading`, when passed, renders an h2 + place line instead, for
 * contexts (the day row) with no page-level H1 of their own to reuse.
 */
export function VereinEventBody({ event, heading = false }: { event: Event; heading?: boolean }) {
  return (
    <>
      {heading && (
        <>
          <h2 className="max-w-[60ch] font-display text-[19px] font-semibold leading-snug">{event.title}</h2>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">{event.place}</p>
        </>
      )}
      <p className="prose-body mt-2 text-[15px]">{event.summary}</p>
      {hasConfirmedDate(event) ? (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <p className="font-mono text-[13px] tnum text-ink-2">
            {shortGermanDate(parseIso(event.isoStart))}
            {event.isoEnd && event.isoEnd !== event.isoStart && ` – ${shortGermanDate(parseIso(event.isoEnd))}`}
          </p>
          <IcsDownloadButton
            event={{
              slug: event.slug,
              title: event.title,
              summary: event.summary,
              location: `${event.place}, Offenbach am Main`,
              isoStart: event.isoStart,
              isoEnd: event.isoEnd,
            }}
          />
        </div>
      ) : (
        <p
          className="mt-4 inline-block px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em]"
          style={{ background: "var(--c-accent-soft)", color: "var(--c-accent)" }}
        >
          Termin noch nicht bestätigt
        </p>
      )}
    </>
  );
}
