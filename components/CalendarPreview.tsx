"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CalendarEntry } from "@/lib/calendar";

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.`;
}

/**
 * The homepage's compact "next dates" line — same "today" problem as
 * components/Calendar.tsx and the same fix: this page is statically
 * prerendered, so filtering to "upcoming" at build time would drift wrong
 * between deploys. Computed on mount instead. Renders nothing (not even a
 * heading) until then, and nothing at all if no entry falls in the future —
 * the full calendar on /radar is the fallback for visitors without JS.
 */
export function CalendarPreview({ entries, limit }: { entries: CalendarEntry[]; limit: number }) {
  const [today, setToday] = useState<number | null>(null);

  useEffect(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setToday(d.getTime());
  }, []);

  if (today === null) return null;

  const upcoming = entries
    .filter((entry) => new Date(`${entry.date}T00:00:00`).getTime() >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);

  if (upcoming.length === 0) return null;

  return (
    <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t pt-8" style={{ borderColor: "var(--c-line)" }}>
      {upcoming.map((entry) => (
        <li key={entry.key}>
          <Link href={entry.href} className="link-underline font-mono text-[13px] tnum">
            {formatDate(entry.date)} — {entry.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}
