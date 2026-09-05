/**
 * Calendar-date arithmetic for the OF-Radar month calendar. Deliberately has
 * nothing to do with time zones or instants — a calendar date (2026-05-28)
 * isn't one, and the moment you round-trip it through a JS Date/UTC to add
 * a day or find its weekday, you've turned it into one, and a reader east
 * of Greenwich sees the wrong day. Every function here works on plain
 * {y, m, d} integers; none of them construct a `Date`.
 *
 * The one place a real instant genuinely matters — "what day is it right
 * now" — is `todayBerlin()`, and that's exactly where the file does reach
 * for `Intl.DateTimeFormat` with an explicit Europe/Berlin time zone,
 * because the server's own clock/time zone (Vercel: UTC) is not the
 * association's.
 */

export type CalendarDate = { y: number; m: number; d: number };

export function parseIso(iso: string): CalendarDate {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

export function toIso({ y, m, d }: CalendarDate): string {
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function isLeapYear(y: number): boolean {
  return y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
}

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function daysInMonth(y: number, m: number): number {
  if (m === 2 && isLeapYear(y)) return 29;
  return DAYS_IN_MONTH[m - 1];
}

/** -1 if a < b, 0 if equal, 1 if a > b — plain integer comparison, y then m then d. */
export function compareDates(a: CalendarDate, b: CalendarDate): -1 | 0 | 1 {
  if (a.y !== b.y) return a.y < b.y ? -1 : 1;
  if (a.m !== b.m) return a.m < b.m ? -1 : 1;
  if (a.d !== b.d) return a.d < b.d ? -1 : 1;
  return 0;
}

export function isSameDate(a: CalendarDate, b: CalendarDate): boolean {
  return compareDates(a, b) === 0;
}

/** True if `date` falls within [start, end] inclusive — the whole-range test multi-day entries need. */
export function isWithinRange(date: CalendarDate, start: CalendarDate, end: CalendarDate): boolean {
  return compareDates(date, start) >= 0 && compareDates(date, end) <= 0;
}

export function addDays({ y, m, d }: CalendarDate, delta: number): CalendarDate {
  let day = d + delta;
  let month = m;
  let year = y;
  while (day > daysInMonth(year, month)) {
    day -= daysInMonth(year, month);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  while (day < 1) {
    month -= 1;
    if (month < 1) {
      month = 12;
      year -= 1;
    }
    day += daysInMonth(year, month);
  }
  return { y: year, m: month, d: day };
}

/** Adds calendar months, clamping the day into the target month (Jan 31 + 1 month -> Feb 28/29, not Mar 3). */
export function addMonths({ y, m, d }: CalendarDate, delta: number): CalendarDate {
  const totalMonths = (y * 12 + (m - 1)) + delta;
  const year = Math.floor(totalMonths / 12);
  const month = (totalMonths % 12) + 1;
  const day = Math.min(d, daysInMonth(year, month));
  return { y: year, m: month, d: day };
}

/**
 * Sakamoto's algorithm — a closed-form Gregorian day-of-week formula, pure
 * integer arithmetic, no Date object anywhere. Returns 0=Sunday..6=Saturday
 * (the conventional numbering); weekdayMonFirst below rotates it to the
 * German Monday-first convention this calendar actually needs.
 */
const SAKAMOTO_T = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
function dayOfWeekSundayFirst({ y, m, d }: CalendarDate): number {
  const yy = m < 3 ? y - 1 : y;
  return (yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) + SAKAMOTO_T[m - 1] + d) % 7;
}

/** 0=Montag..6=Sonntag. */
export function weekdayMonFirst(date: CalendarDate): number {
  return (dayOfWeekSundayFirst(date) + 6) % 7;
}

/**
 * "What day is it right now, in Offenbach" — the one function here that
 * looks at a real instant. Reads the current moment through Europe/Berlin
 * explicitly via Intl.DateTimeFormat rather than trusting the server
 * process's own time zone (Vercel's is UTC) or the visitor's browser.
 */
export function todayBerlin(): CalendarDate {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(new Date());
  const get = (type: string) => Number(parts.find((p) => p.type === type)!.value);
  return { y: get("year"), m: get("month"), d: get("day") };
}

export type MonthGridCell = CalendarDate & { inMonth: boolean };

/**
 * Every cell for a Monday-first month grid: the target month's own days,
 * plus exactly the leading days from the previous month needed to reach
 * the first Monday and the trailing days from the next month needed to
 * fill out the last week — never a full fixed 42-cell block, so a
 * five-week month stays five rows and a six-week one stays six.
 */
export function getMonthGrid(year: number, month: number): MonthGridCell[] {
  const firstWeekday = weekdayMonFirst({ y: year, m: month, d: 1 }); // 0=Mon
  const totalDays = daysInMonth(year, month);
  const cells: MonthGridCell[] = [];

  for (let i = 0; i < firstWeekday; i++) {
    const leading = addDays({ y: year, m: month, d: 1 }, i - firstWeekday);
    cells.push({ ...leading, inMonth: false });
  }
  for (let d = 1; d <= totalDays; d++) {
    cells.push({ y: year, m: month, d, inMonth: true });
  }
  let trailing = 1;
  while (cells.length % 7 !== 0) {
    const next = addMonths({ y: year, m: month, d: 1 }, 1);
    cells.push({ y: next.y, m: next.m, d: trailing, inMonth: false });
    trailing += 1;
  }
  return cells;
}

const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
export function weekdayShortLabels(): string[] {
  return WEEKDAY_LABELS;
}

const MONTH_FORMATTER = new Intl.DateTimeFormat("de-DE", { month: "long", timeZone: "UTC" });
const FULL_DATE_FORMATTER = new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/**
 * Intl.DateTimeFormat needs *a* Date object to format, even though the
 * value being formatted is a plain calendar date with no time-of-day or
 * zone of its own — constructing it via Date.UTC and formatting with
 * timeZone: "UTC" is the one safe way to do that: the (y, m, d) triple
 * goes in and the same (y, m, d) comes back out, with no local-time-zone
 * shift anywhere in between. This is not the "round-trip through UTC" the
 * date arithmetic above avoids — no arithmetic happens on this Date, it
 * exists for one tick purely to be handed to the formatter.
 */
function toUtcMidnight({ y, m, d }: CalendarDate): Date {
  return new Date(Date.UTC(y, m - 1, d));
}

export function monthLabel(y: number, m: number): string {
  const name = MONTH_FORMATTER.format(toUtcMidnight({ y, m, d: 1 }));
  return `${name} ${y}`;
}

export function fullGermanDate(date: CalendarDate): string {
  return FULL_DATE_FORMATTER.format(toUtcMidnight(date));
}

/** "28.05.2026" — the site's existing plain numeric German date format. */
export function shortGermanDate(date: CalendarDate): string {
  return `${String(date.d).padStart(2, "0")}.${String(date.m).padStart(2, "0")}.${date.y}`;
}
