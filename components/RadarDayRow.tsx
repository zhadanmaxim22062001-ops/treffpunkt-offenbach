"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { RadarItemBody } from "@/components/RadarItemBody";
import { VereinEventBody } from "@/components/VereinEventBody";
import { defaultWindowSelection, entriesOnDate, nextEntryOnOrAfter, type CalendarEntry } from "@/lib/calendar";
import {
  addDays,
  addMonths,
  compareDates,
  fullGermanDate,
  weekdayLongLabel,
  isSameDate,
  monthShortLabel,
  parseIso,
  shortGermanDate,
  toIso,
  weekdayMonFirst,
  weekdayShortLabels,
  type CalendarDate,
} from "@/lib/date-berlin";

const WINDOW_SIZE = 10;
const MONTHS_BACK = 12;
const MONTHS_FORWARD = 24;

function windowHref(basePath: string, start: CalendarDate): string {
  return `${basePath}?ab=${toIso(start)}`;
}

/** Every day in the ten-day window starting at `start`. */
function windowDays(start: CalendarDate): CalendarDate[] {
  return Array.from({ length: WINDOW_SIZE }, (_, i) => addDays(start, i));
}

/**
 * The OF-Radar ten-day row — replaces the old month grid. A month view for
 * a dataset with two or three entries was an empty page pretending to be a
 * product; this shows exactly what's coming, starting today, with the day
 * of week attached to every date so nobody has to do calendar math in
 * their head.
 *
 * role="radiogroup"/"radio" (not role="grid"), because a single row where
 * exactly one day is ever the current choice IS the honest ARIA mapping —
 * a grid is for a two-dimensional structure, which this deliberately isn't
 * any more. Native radiogroup convention usually has arrow keys change the
 * checked value as focus moves; this widget keeps that split (arrows move
 * focus, Enter/Space commits the selection) to match the composite-widget,
 * roving-tabindex pattern already used elsewhere in the app, and because a
 * date is a bigger commitment (it reloads the panel below) than a plain
 * radio choice usually is.
 */
export function RadarDayRow({
  entries,
  initialWindowStartIso,
  todayIso,
  initialSelectedIso,
  basePath,
}: {
  entries: CalendarEntry[];
  initialWindowStartIso: string;
  todayIso: string;
  initialSelectedIso: string | null;
  basePath: string;
}) {
  const router = useRouter();
  const today = parseIso(todayIso);
  const minStart = addMonths(today, -MONTHS_BACK);
  const maxStart = addMonths(today, MONTHS_FORWARD);

  const [windowStart, setWindowStart] = useState<CalendarDate>(() => parseIso(initialWindowStartIso));
  const [selectedIso, setSelectedIso] = useState<string | null>(initialSelectedIso);
  const [focusedIso, setFocusedIso] = useState<string>(() => initialSelectedIso ?? initialWindowStartIso);

  const cellRefs = useRef(new Map<string, HTMLDivElement>());
  const focusPending = useRef(false);

  useEffect(() => {
    if (!focusPending.current) return;
    focusPending.current = false;
    cellRefs.current.get(focusedIso)?.focus();
  }, [focusedIso, windowStart]);

  const days = useMemo(() => windowDays(windowStart), [windowStart]);

  const prevTarget = addDays(windowStart, -WINDOW_SIZE);
  const nextTarget = addDays(windowStart, WINDOW_SIZE);
  const prevDisabled = compareDates(prevTarget, minStart) < 0;
  const nextDisabled = compareDates(nextTarget, maxStart) > 0;
  const isDefaultWindow = isSameDate(windowStart, today);

  /** Changing the window always recomputes selection from scratch via the
   *  one default rule above — a stale selection from a previous window
   *  showing under an unrelated row would be more confusing than a clean
   *  recompute, and it keeps "first load", "paged", and "Heute" all
   *  behaving the same way instead of three special cases. */
  function changeWindow(start: CalendarDate) {
    if (compareDates(start, minStart) < 0 || compareDates(start, maxStart) > 0) return;
    const newDays = windowDays(start);
    setWindowStart(start);
    setSelectedIso(defaultWindowSelection(entries, newDays, todayIso));
    router.replace(windowHref(basePath, start), { scroll: false });
  }

  function handlePrevClick(e: React.MouseEvent) {
    e.preventDefault();
    if (prevDisabled) return;
    changeWindow(prevTarget);
  }
  function handleNextClick(e: React.MouseEvent) {
    e.preventDefault();
    if (nextDisabled) return;
    changeWindow(nextTarget);
  }
  function handleToday() {
    if (isDefaultWindow) return;
    changeWindow(today);
  }

  function selectDay(date: CalendarDate) {
    const iso = toIso(date);
    setSelectedIso(iso);
    setFocusedIso(iso);
  }

  /** Arrow/Home/End move focus only (Enter/Space selects) — crossing past
   *  either end of the window pages it by a full ten days, same direction,
   *  same defaultSelection recompute as any other window change. A page
   *  that would cross the browsing range's edge is simply ignored, the
   *  same way the disabled prev/next controls refuse to. */
  function moveFocus(newDate: CalendarDate) {
    const inWindow = days.some((d) => isSameDate(d, newDate));
    if (inWindow) {
      focusPending.current = true;
      setFocusedIso(toIso(newDate));
      return;
    }
    const before = compareDates(newDate, windowStart) < 0;
    const newStart = before ? prevTarget : nextTarget;
    if (compareDates(newStart, minStart) < 0 || compareDates(newStart, maxStart) > 0) return;
    const newDays = windowDays(newStart);
    focusPending.current = true;
    setFocusedIso(toIso(newDate));
    setWindowStart(newStart);
    setSelectedIso(defaultWindowSelection(entries, newDays, todayIso));
    router.replace(windowHref(basePath, newStart), { scroll: false });
  }

  function handleRowKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const current = parseIso(focusedIso);
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        moveFocus(addDays(current, -1));
        return;
      case "ArrowRight":
        e.preventDefault();
        moveFocus(addDays(current, 1));
        return;
      case "Home":
        e.preventDefault();
        moveFocus(windowStart);
        return;
      case "End":
        e.preventDefault();
        moveFocus(days[WINDOW_SIZE - 1]);
        return;
      case "Enter":
      case " ":
        e.preventDefault();
        selectDay(current);
        return;
    }
  }

  const selectedEntries = selectedIso ? entriesOnDate(entries, selectedIso) : [];
  const searchFromIso = selectedIso ?? toIso(windowStart);
  const nextFallback = selectedEntries.length === 0 ? nextEntryOnOrAfter(entries, searchFromIso) : undefined;

  const rangeLabel = `${shortGermanDate(days[0])} – ${shortGermanDate(days[WINDOW_SIZE - 1])}`;

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        {prevDisabled ? (
          <span aria-disabled="true" className="px-2 py-1 font-display text-[20px]" style={{ color: "var(--c-muted)" }}>
            «<span className="sr-only">Zehn Tage zurück</span>
          </span>
        ) : (
          <Link
            href={windowHref(basePath, prevTarget)}
            onClick={handlePrevClick}
            className="px-2 py-1 font-display text-[20px] transition-colors duration-[120ms] hover:text-accent"
          >
            «<span className="sr-only">Zehn Tage zurück</span>
          </Link>
        )}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <p className="font-mono text-[12px] tnum uppercase tracking-[0.08em] text-muted" aria-live="polite">
            {rangeLabel}
          </p>
          <button
            type="button"
            onClick={handleToday}
            disabled={isDefaultWindow}
            className="border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors duration-[120ms] enabled:hover:bg-accent-soft disabled:opacity-40"
            style={{ borderColor: "var(--c-line)" }}
          >
            Heute
          </button>
        </div>
        {nextDisabled ? (
          <span aria-disabled="true" className="px-2 py-1 font-display text-[20px]" style={{ color: "var(--c-muted)" }}>
            <span className="sr-only">Zehn Tage vor</span>»
          </span>
        ) : (
          <Link
            href={windowHref(basePath, nextTarget)}
            onClick={handleNextClick}
            className="px-2 py-1 font-display text-[20px] transition-colors duration-[120ms] hover:text-accent"
          >
            <span className="sr-only">Zehn Tage vor</span>»
          </Link>
        )}
      </div>

      {/* Same restarted-keyframe trick as the month calendar this replaces
          (see the removed RadarCalendarWidget for the AnimatePresence bug
          that motivated it): a `key` change unmounts/remounts the row
          immediately, in the same render, so keyboard focus can move onto
          the new window's cell the instant it exists. */}
      <div key={toIso(windowStart)} className="radar-row-fade mt-6">
        <div
          role="radiogroup"
          aria-label={`Termine, ${rangeLabel}`}
          onKeyDown={handleRowKeyDown}
          className="no-scrollbar flex snap-x snap-mandatory gap-1 overflow-x-auto min-[900px]:grid min-[900px]:grid-cols-10 min-[900px]:overflow-visible"
        >
          {days.map((day, i) => {
            const iso = toIso(day);
            const count = entriesOnDate(entries, iso).length;
            const isToday = isSameDate(day, today);
            const isSelected = selectedIso === iso;
            const isFocusTarget = focusedIso === iso;
            const weekday = weekdayMonFirst(day);
            const isWeekend = weekday >= 5;
            const dotCount = Math.min(count, 2);
            const showMonthLabel = i === 0 || day.m !== days[i - 1].m;
            // Three independent signals, each meaning exactly one thing, so
            // they can combine without turning ambiguous: RING (today) is a
            // 2px border with no fill; FILL (selected) is a solid circle;
            // DOT (has entries) sits below the circle regardless of the
            // other two. A plain day with none of these draws no circle at
            // all — just a number, same as before this rewrite. Today AND
            // selected together still show both: the ring just switches to
            // --c-paper so it reads against the accent fill instead of
            // disappearing into it.
            const ringColor = isSelected ? "var(--c-paper)" : "var(--c-accent)";
            const numberColor = isSelected
              ? "var(--c-paper)"
              : isToday
                ? "var(--c-accent)"
                : count > 0
                  ? "var(--c-accent)"
                  : isWeekend
                    ? "var(--c-muted)"
                    : "var(--c-ink)";
            return (
              <div
                key={iso}
                onClick={() => selectDay(day)}
                className="flex min-w-[54px] flex-1 shrink-0 snap-start cursor-pointer flex-col items-center gap-1.5 py-2 min-[900px]:min-w-0"
              >
                {/* Month and weekday sit OUTSIDE the radio: its visible text is
                    then just the day number, which is exactly how the accessible
                    name starts — "click 23" works for speech input (WCAG 2.5.3). */}
                <span
                  className="h-[13px] font-mono text-[10px] uppercase tracking-[0.06em] text-muted"
                  style={{ opacity: showMonthLabel ? 1 : 0 }}
                  aria-hidden="true"
                >
                  {showMonthLabel ? monthShortLabel(day) : "–"}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted" aria-hidden="true">
                  {weekdayShortLabels()[weekday]}
                </span>
                <div
                  ref={(el) => {
                    if (el) cellRefs.current.set(iso, el);
                    else cellRefs.current.delete(iso);
                  }}
                  role="radio"
                  tabIndex={isFocusTarget ? 0 : -1}
                  aria-checked={isSelected}
                  aria-current={isToday ? "date" : undefined}
                  aria-label={`${fullGermanDate(day)}, ${weekdayLongLabel(day)}${
                    count === 0 ? "" : `, ${count} ${count === 1 ? "Termin" : "Termine"}`
                  }`}
                  className="flex flex-col items-center gap-1.5"
                >
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-full font-mono text-[16px] tnum"
                    style={{
                      backgroundColor: isSelected ? "var(--c-accent)" : "transparent",
                      boxShadow: isToday ? `inset 0 0 0 2px ${ringColor}` : "none",
                      color: numberColor,
                      fontWeight: count > 0 || isToday || isSelected ? 600 : 400,
                    }}
                  >
                    {day.d}
                  </span>
                  <span className="flex h-[4px] gap-[3px]" aria-hidden="true">
                    {Array.from({ length: dotCount }).map((_, dotIndex) => (
                      <span
                        key={dotIndex}
                        className="block h-[4px] w-[4px] rounded-full"
                        style={{ backgroundColor: "var(--c-accent)" }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-10 border-t pt-8" style={{ borderColor: "var(--c-line)" }}>
        <p className="eyebrow mb-4">{selectedIso ? fullGermanDate(parseIso(selectedIso)) : rangeLabel}</p>
        {selectedEntries.length > 0 ? (
          <div className="flex flex-col gap-10">
            {selectedEntries.map((entry) => (
              <div key={entry.key}>
                {entry.source === "radar" ? (
                  <RadarItemBody item={entry.item} />
                ) : (
                  <VereinEventBody event={entry.item} heading />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="prose-body max-w-[52ch] text-[15px] text-muted">
            {selectedIso
              ? `Keine Termine am ${fullGermanDate(parseIso(selectedIso))}.`
              : isDefaultWindow
                ? "In den nächsten zehn Tagen ist nichts eingetragen."
                : `Keine Termine vom ${rangeLabel}.`}
            {nextFallback && (
              <>
                {" "}
                Nächster Termin:{" "}
                <Link href={nextFallback.href} className="link-underline">
                  {shortGermanDate(parseIso(nextFallback.dateStart))} — {nextFallback.title}
                </Link>
                .
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
