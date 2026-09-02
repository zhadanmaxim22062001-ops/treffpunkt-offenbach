"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { RadarItem } from "@/lib/radar-content";

const WEEK_MS = 7 * 86_400_000;
const WINDOW_WEEKS = 12;

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.`;
}

/**
 * Frequenz items on a 12-week horizontal timeline. "Today" is computed on
 * mount, not at build time — this page is statically prerendered, so a
 * build-time "today" would drift wrong between deploys. Returns null until
 * mounted and null again if nothing falls in the window; every frequenz
 * item still appears in the normal list below regardless, so there's
 * nothing to fall back to here for visitors without JS.
 */
export function RadarTimeline({ items }: { items: RadarItem[] }) {
  const [today, setToday] = useState<number | null>(null);

  useEffect(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setToday(d.getTime());
  }, []);

  if (today === null) return null;

  const windowEnd = today + WINDOW_WEEKS * WEEK_MS;
  const upcoming = items
    .filter((item) => {
      const t = new Date(`${item.date}T00:00:00`).getTime();
      return t >= today && t <= windowEnd;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  if (upcoming.length === 0) return null;

  return (
    <div className="mb-12 border p-6" style={{ borderColor: "var(--c-line)", backgroundColor: "var(--c-paper-2)" }}>
      <div className="flex items-baseline justify-between">
        <p className="eyebrow">Frequenz — nächste 12 Wochen</p>
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
        {upcoming.map((item) => {
          const t = new Date(`${item.date}T00:00:00`).getTime();
          const pct = ((t - today) / (windowEnd - today)) * 100;
          return (
            <Link
              key={item.slug}
              href={`/radar/${item.slug}`}
              className="group absolute top-0 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pct}%` }}
              aria-label={`${item.headline}, ${formatDate(item.date)}`}
            >
              <span
                className="block h-3 w-3 border-2 bg-paper-2 transition-colors duration-[120ms] group-hover:bg-accent"
                style={{ borderColor: "var(--c-accent)", borderRadius: "999px" }}
              />
            </Link>
          );
        })}
      </div>

      <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
        {upcoming.map((item) => (
          <li key={item.slug}>
            <Link href={`/radar/${item.slug}`} className="link-underline font-mono text-[12px] tnum">
              {formatDate(item.date)} — {item.headline}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
