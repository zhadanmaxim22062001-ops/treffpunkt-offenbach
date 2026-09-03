"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CalendarEntry } from "@/lib/calendar";

const WEEK_MS = 7 * 86_400_000;
const WINDOW_WEEKS = 12;

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.`;
}

/**
 * The Innenstadt calendar: the association's own confirmed events merged
 * with frequenz-category OF-Radar items (see lib/calendar.ts), on one
 * 12-week horizontal timeline. "Today" is computed on mount, not at build
 * time — this page is statically prerendered, so a build-time "today" would
 * drift wrong between deploys. Returns null until mounted and null again if
 * nothing falls in the window; every entry still appears in its own full
 * listing elsewhere (events on /veranstaltungen, radar items in the list
 * below) regardless, so there's nothing to fall back to here for visitors
 * without JS.
 */
export function Calendar({ entries }: { entries: CalendarEntry[] }) {
  const [today, setToday] = useState<number | null>(null);

  useEffect(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setToday(d.getTime());
  }, []);

  if (today === null) return null;

  const windowEnd = today + WINDOW_WEEKS * WEEK_MS;
  const upcoming = entries
    .filter((entry) => {
      const t = new Date(`${entry.date}T00:00:00`).getTime();
      return t >= today && t <= windowEnd;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  if (upcoming.length === 0) return null;

  return (
    <div className="mb-12 border p-6" style={{ borderColor: "var(--c-line)", backgroundColor: "var(--c-paper-2)" }}>
      <div className="flex items-baseline justify-between">
        <p className="eyebrow">Innenstadt-Kalender — nächste 12 Wochen</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">Heute → +12 Wochen</p>
      </div>

      <div className="relative mt-8 h-px" style={{ backgroundColor: "var(--c-line)" }}>
        {Array.from({ length: WINDOW_WEEKS + 1 }).map((_, w) => (
          <div
            key={w}
            className="absolute top-0 h-2 w-px -translate-y-1/2"
            style={{ left: `${(w / WINDOW_WEEKS) * 100}%`, backgroundColor: "var(--c-line)" }}
          />
        ))}
        {/* Decorative markers, not links: on a 12-week timeline two entries
            can fall a single day apart, so any WCAG-2.5.8-sized (24px) tap
            target here would overlap its neighbour — a dense timeline and a
            minimum target size are fundamentally in tension. Every entry
            already has a properly sized, properly spaced link in the plain
            list below (the "equivalent control" WCAG 2.5.8 itself allows
            for), so these stay visual-only rather than a second, cramped
            set of tap targets. */}
        {upcoming.map((entry) => {
          const t = new Date(`${entry.date}T00:00:00`).getTime();
          const pct = ((t - today) / (windowEnd - today)) * 100;
          return (
            <span
              key={entry.key}
              aria-hidden="true"
              title={`${entry.title}, ${formatDate(entry.date)}`}
              className="absolute top-0 block h-3 w-3 -translate-x-1/2 -translate-y-1/2 border-2 bg-paper-2"
              style={{ left: `${pct}%`, borderColor: "var(--c-accent)", borderRadius: "999px" }}
            />
          );
        })}
      </div>

      <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
        {upcoming.map((entry) => (
          <li key={entry.key}>
            <Link href={entry.href} className="link-underline font-mono text-[12px] tnum">
              {formatDate(entry.date)} — {entry.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
