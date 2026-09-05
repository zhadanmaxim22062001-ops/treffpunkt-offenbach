"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { RadarItemBody } from "@/components/RadarItemBody";
import { VereinEventBody } from "@/components/VereinEventBody";
import {
  entriesOnDate,
  nextEntryOnOrAfter,
  type CalendarEntry,
} from "@/lib/calendar";
import {
  addDays,
  addMonths,
  fullGermanDate,
  getMonthGrid,
  isSameDate,
  monthLabel,
  parseIso,
  shortGermanDate,
  toIso,
  weekdayMonFirst,
  weekdayShortLabels,
  type CalendarDate,
} from "@/lib/date-berlin";

const MONTHS_BACK = 12;
const MONTHS_FORWARD = 24;

function monthKey(y: number, m: number): string {
  return `${y}-${String(m).padStart(2, "0")}`;
}

function monthIndex(y: number, m: number): number {
  return y * 12 + (m - 1);
}

function monthParamHref(basePath: string, y: number, m: number): string {
  return `${basePath}?monat=${monthKey(y, m)}`;
}

/**
 * The OF-Radar month calendar — a real ARIA grid (role="grid" /
 * role="row" / role="gridcell", one roving tabindex, arrow/PageUp/
 * PageDown/Home/End/Enter/Space per the standard date-grid pattern), not a
 * set of divs with onClick. Receives every calendar entry unfiltered — the
 * dataset is small enough that paging between months never needs a fresh
 * server request, only a state update — and computes everything else
 * (which days have something, the selected day's full detail) from that.
 *
 * Month navigation keeps a real ?monat=YYYY-MM in the URL (so a month is
 * linkable) via router.replace, but the prev/next controls are always real
 * `<Link>`s to that same URL first — a visitor without JS gets a full page
 * reload to the right month for free; the onClick handlers below only ever
 * intercept and short-circuit that when JS is actually running.
 */
export function RadarCalendarWidget({
  entries,
  initialYear,
  initialMonth,
  todayIso,
  initialSelectedIso,
  basePath,
}: {
  entries: CalendarEntry[];
  initialYear: number;
  initialMonth: number;
  todayIso: string;
  initialSelectedIso: string | null;
  basePath: string;
}) {
  const router = useRouter();
  const today = parseIso(todayIso);
  const minIndex = monthIndex(today.y, today.m) - MONTHS_BACK;
  const maxIndex = monthIndex(today.y, today.m) + MONTHS_FORWARD;

  const [displayed, setDisplayed] = useState<{ y: number; m: number }>({ y: initialYear, m: initialMonth });
  const [selectedIso, setSelectedIso] = useState<string | null>(initialSelectedIso);
  const [focusedIso, setFocusedIso] = useState<string>(() => {
    if (initialSelectedIso) return initialSelectedIso;
    if (initialYear === today.y && initialMonth === today.m) return todayIso;
    return toIso({ y: initialYear, m: initialMonth, d: 1 });
  });

  const cellRefs = useRef(new Map<string, HTMLDivElement>());
  const focusPending = useRef(false);

  useEffect(() => {
    if (!focusPending.current) return;
    focusPending.current = false;
    cellRefs.current.get(focusedIso)?.focus();
  }, [focusedIso, displayed]);

  const grid = useMemo(() => getMonthGrid(displayed.y, displayed.m), [displayed.y, displayed.m]);
  const weeks = useMemo(() => {
    const w: (typeof grid)[] = [];
    for (let i = 0; i < grid.length; i += 7) w.push(grid.slice(i, i + 7));
    return w;
  }, [grid]);

  const prevIndex = monthIndex(displayed.y, displayed.m) - 1;
  const nextIndex = monthIndex(displayed.y, displayed.m) + 1;
  const prevDisabled = prevIndex < minIndex;
  const nextDisabled = nextIndex > maxIndex;
  const prevTarget = addMonths({ y: displayed.y, m: displayed.m, d: 1 }, -1);
  const nextTarget = addMonths({ y: displayed.y, m: displayed.m, d: 1 }, 1);

  /** Changing the displayed month always clears the selection — the
   *  previously-selected day is no longer in view, and showing its detail
   *  panel under an unrelated month's grid would be more confusing than a
   *  clean "nothing selected" state. `selectDay`/`handleToday` re-select
   *  explicitly afterward when that's actually what the user asked for. */
  function changeMonth(y: number, m: number) {
    const idx = monthIndex(y, m);
    if (idx < minIndex || idx > maxIndex) return;
    setDisplayed({ y, m });
    setSelectedIso(null);
    router.replace(monthParamHref(basePath, y, m), { scroll: false });
  }

  function handlePrevClick(e: React.MouseEvent) {
    e.preventDefault();
    if (prevDisabled) return;
    changeMonth(prevTarget.y, prevTarget.m);
  }
  function handleNextClick(e: React.MouseEvent) {
    e.preventDefault();
    if (nextDisabled) return;
    changeMonth(nextTarget.y, nextTarget.m);
  }
  function handleToday(e: React.MouseEvent) {
    e.preventDefault();
    changeMonth(today.y, today.m);
    setSelectedIso(todayIso);
    focusPending.current = true;
    setFocusedIso(todayIso);
  }

  function selectDay(date: CalendarDate) {
    const iso = toIso(date);
    if (date.m !== displayed.m || date.y !== displayed.y) {
      setDisplayed({ y: date.y, m: date.m });
      router.replace(monthParamHref(basePath, date.y, date.m), { scroll: false });
    }
    setSelectedIso(iso);
    focusPending.current = true;
    setFocusedIso(iso);
  }

  /** Arrow/PageUp/PageDown/Home/End move focus only — never the selection
   *  (Enter/Space is what selects). Crossing into a neighbouring month
   *  swaps the displayed grid but, per changeMonth above, drops the stale
   *  selection rather than showing it under the new month. */
  function moveFocus(newDate: CalendarDate) {
    const idx = monthIndex(newDate.y, newDate.m);
    if (idx < minIndex || idx > maxIndex) return;
    focusPending.current = true;
    setFocusedIso(toIso(newDate));
    if (newDate.m !== displayed.m || newDate.y !== displayed.y) {
      setDisplayed({ y: newDate.y, m: newDate.m });
      setSelectedIso(null);
      router.replace(monthParamHref(basePath, newDate.y, newDate.m), { scroll: false });
    }
  }

  function handleGridKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
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
      case "ArrowUp":
        e.preventDefault();
        moveFocus(addDays(current, -7));
        return;
      case "ArrowDown":
        e.preventDefault();
        moveFocus(addDays(current, 7));
        return;
      case "PageUp":
        e.preventDefault();
        moveFocus(addMonths(current, -1));
        return;
      case "PageDown":
        e.preventDefault();
        moveFocus(addMonths(current, 1));
        return;
      case "Home":
        e.preventDefault();
        moveFocus(addDays(current, -weekdayMonFirst(current)));
        return;
      case "End":
        e.preventDefault();
        moveFocus(addDays(current, 6 - weekdayMonFirst(current)));
        return;
      case "Enter":
      case " ":
        e.preventDefault();
        selectDay(current);
        return;
    }
  }

  const selectedEntries = selectedIso ? entriesOnDate(entries, selectedIso) : [];
  // Nothing selected (browsed to a month with no auto-selection) gets a
  // month-level message and searches forward from that month's first day;
  // a concretely-selected-but-empty day gets a day-level message and
  // searches forward from that specific day — never from "today" once the
  // user has navigated somewhere else, which would talk about a date not
  // even in view.
  const searchFromIso = selectedIso ?? toIso({ y: displayed.y, m: displayed.m, d: 1 });
  const nextFallback = selectedEntries.length === 0 ? nextEntryOnOrAfter(entries, searchFromIso) : undefined;

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        {prevDisabled ? (
          <span aria-disabled="true" className="px-2 py-1 font-display text-[20px]" style={{ color: "var(--c-muted)", opacity: 0.4 }}>
            ‹<span className="sr-only">Voriger Monat</span>
          </span>
        ) : (
          <Link
            href={monthParamHref(basePath, prevTarget.y, prevTarget.m)}
            onClick={handlePrevClick}
            className="px-2 py-1 font-display text-[20px] transition-colors duration-[120ms] hover:text-accent"
          >
            ‹<span className="sr-only">Voriger Monat</span>
          </Link>
        )}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <p className="font-display text-[17px] font-semibold tnum" aria-live="polite">
            {monthLabel(displayed.y, displayed.m)}
          </p>
          <button
            type="button"
            onClick={handleToday}
            className="border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors duration-[120ms] hover:bg-accent-soft"
            style={{ borderColor: "var(--c-line)" }}
          >
            Heute
          </button>
        </div>
        {nextDisabled ? (
          <span aria-disabled="true" className="px-2 py-1 font-display text-[20px]" style={{ color: "var(--c-muted)", opacity: 0.4 }}>
            <span className="sr-only">Nächster Monat</span>›
          </span>
        ) : (
          <Link
            href={monthParamHref(basePath, nextTarget.y, nextTarget.m)}
            onClick={handleNextClick}
            className="px-2 py-1 font-display text-[20px] transition-colors duration-[120ms] hover:text-accent"
          >
            <span className="sr-only">Nächster Monat</span>›
          </Link>
        )}
      </div>

      {/*
        A plain CSS keyframe restarted by `key`, not Framer Motion's
        AnimatePresence — deliberately. AnimatePresence's exit-then-enter
        choreography delays mounting the new month's cells until the old
        month's exit animation finishes, which meant the focus-follow
        effect below ran before the newly-focused cell existed in the DOM
        yet and silently failed to move real keyboard focus. A `key`
        change here still unmounts/remounts the div (so the animation
        restarts), but immediately, in the same render — nothing to wait
        on, so the ref is there the moment the effect runs. Respects
        prefers-reduced-motion via the sitewide safety net in globals.css
        (animation-duration forced to 0.01ms), same as the rest of the
        project's animations — no separate reduced-motion branch needed
        here.
      */}
      <div key={monthKey(displayed.y, displayed.m)} className="radar-grid-fade mt-6">
        <div
          role="grid"
          aria-label={`Kalender ${monthLabel(displayed.y, displayed.m)}`}
          onKeyDown={handleGridKeyDown}
          className="grid grid-cols-7 gap-1"
        >
            <div role="row" className="col-span-7 grid grid-cols-7">
              {weekdayShortLabels().map((label) => (
                <div
                  key={label}
                  role="columnheader"
                  className="pb-2 text-center font-mono text-[10px] uppercase tracking-[0.08em] text-muted"
                >
                  {label}
                </div>
              ))}
            </div>
            {weeks.map((week, wi) => (
              <div role="row" key={wi} className="col-span-7 grid grid-cols-7 gap-1">
                {week.map((cell) => {
                  if (!cell.inMonth) {
                    return (
                      <div
                        key={`${cell.y}-${cell.m}-${cell.d}`}
                        aria-hidden="true"
                        className="flex min-h-[40px] items-start justify-center pt-2 font-mono text-[13px] tnum"
                        style={{ color: "var(--c-muted)", opacity: 0.35 }}
                      >
                        {cell.d}
                      </div>
                    );
                  }
                  const iso = toIso(cell);
                  const count = entriesOnDate(entries, iso).length;
                  const isToday = isSameDate(cell, today);
                  const isSelected = selectedIso === iso;
                  const isFocusTarget = focusedIso === iso;
                  const dotCount = Math.min(count, 2);
                  return (
                    <div
                      key={iso}
                      ref={(el) => {
                        if (el) cellRefs.current.set(iso, el);
                        else cellRefs.current.delete(iso);
                      }}
                      role="gridcell"
                      tabIndex={isFocusTarget ? 0 : -1}
                      aria-selected={isSelected}
                      aria-current={isToday ? "date" : undefined}
                      aria-label={
                        count === 0
                          ? fullGermanDate(cell)
                          : `${fullGermanDate(cell)}, ${count} ${count === 1 ? "Termin" : "Termine"}`
                      }
                      onClick={() => selectDay(cell)}
                      className="flex min-h-[40px] cursor-pointer flex-col items-center justify-start gap-1 pt-2 outline-none"
                      style={{
                        backgroundColor: isSelected ? "var(--c-accent)" : "transparent",
                        boxShadow: isToday
                          ? `inset 0 0 0 1px ${isSelected ? "var(--c-paper)" : "var(--c-accent)"}`
                          : "none",
                      }}
                    >
                      <span
                        className="font-mono text-[13px] tnum"
                        style={{
                          color: isSelected ? "var(--c-paper)" : count > 0 ? "var(--c-accent)" : "var(--c-ink)",
                          fontWeight: count > 0 ? 600 : 400,
                        }}
                      >
                        {cell.d}
                      </span>
                      <span className="flex h-[4px] gap-[3px]" aria-hidden="true">
                        {Array.from({ length: dotCount }).map((_, i) => (
                          <span
                            key={i}
                            className="block h-[4px] w-[4px] rounded-full"
                            style={{ backgroundColor: isSelected ? "var(--c-paper)" : "var(--c-accent)" }}
                          />
                        ))}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
      </div>

      <div className="mt-10 border-t pt-8" style={{ borderColor: "var(--c-line)" }}>
        <p className="eyebrow mb-4">
          {selectedIso ? fullGermanDate(parseIso(selectedIso)) : monthLabel(displayed.y, displayed.m)}
        </p>
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
              : `Keine Termine im ${monthLabel(displayed.y, displayed.m)}.`}
            {nextFallback && (
              <>
                {" "}
                Der nächste Termin ist am{" "}
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
