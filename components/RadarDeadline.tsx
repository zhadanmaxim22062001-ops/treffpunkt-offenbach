"use client";

import { useEffect, useState } from "react";
import { IcsDownloadButton } from "@/components/IcsDownloadButton";

/**
 * "noch N Tage" for a radar item's deadline. Computed client-side on
 * purpose: this page is statically prerendered, so a server-computed day
 * count would freeze at build time and read wrong the day after the next
 * deploy. Starts blank and fills in after mount — same reasoning as
 * components/motion.tsx's mount-driven reveals, just for correctness here
 * rather than animation.
 */
export function RadarDeadline({
  slug,
  headline,
  summary,
  deadline,
}: {
  slug: string;
  headline: string;
  summary: string;
  deadline: string;
}) {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(`${deadline}T00:00:00`);
    setDays(Math.round((target.getTime() - today.getTime()) / 86_400_000));
  }, [deadline]);

  const urgent = days !== null && days < 14;
  const label =
    days === null
      ? " "
      : days < 0
        ? "Frist abgelaufen"
        : days === 0
          ? "Frist: heute"
          : `noch ${days} ${days === 1 ? "Tag" : "Tage"}`;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <span
        className="font-mono text-[11px] uppercase tracking-[0.08em] tnum"
        style={{ color: urgent ? "var(--c-signal)" : "var(--c-muted)" }}
      >
        {label}
      </span>
      <IcsDownloadButton
        event={{ slug: `${slug}-frist`, title: `Frist: ${headline}`, summary, isoStart: deadline }}
        label="Frist als .ics herunterladen"
      />
    </div>
  );
}
