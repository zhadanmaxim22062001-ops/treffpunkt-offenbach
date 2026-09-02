"use client";

import { buildIcs, type IcsEvent } from "@/lib/ics";

export function IcsDownloadButton({ event, label = "Termin als .ics herunterladen" }: { event: IcsEvent; label?: string }) {
  function handleClick() {
    const blob = new Blob([buildIcs(event)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.slug}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="border px-4 py-2 font-display text-[13px] font-semibold transition-colors duration-[120ms] hover:bg-accent-soft"
      style={{ borderColor: "var(--c-line)" }}
    >
      {label}
    </button>
  );
}
