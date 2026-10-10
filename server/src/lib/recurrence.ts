/**
 * Expansion of a scenario event's recurrence into concrete dates.
 *
 * `src/lib/` holds functions with no I/O — no database, no network, no clock.
 * Anything needing a `Pool` belongs in `db/repositories/`. That constraint is
 * what makes this logic cheap to test exhaustively, which matters here because
 * date recurrence has more edge cases than it first appears.
 *
 * Two deliberate choices:
 *
 * 1. **No `Date` objects.** Everything is integer year/month/day arithmetic on
 *    'YYYY-MM-DD' strings. A `Date` carries a time and a timezone, and
 *    constructing one from a date-only string silently places it at UTC
 *    midnight — which then reads as the *previous* day anywhere east of UTC.
 *    That is the same class of bug the DATE type parser in db/typeParsers.ts
 *    exists to avoid.
 *
 * 2. **Monthly and yearly recurrence anchors to the original day-of-month** and
 *    clamps only where the target month is too short. Postgres `generate_series`
 *    accumulates instead, so a monthly series from Jan 31 yields
 *    Jan 31, Feb 28, Mar 28, Apr 28 … — once February shortens the date it never
 *    recovers, and a monthly contribution silently drifts earlier forever.
 *    Anchoring gives Jan 31, Feb 28, Mar 31, Apr 30 instead.
 */

export type RecurrenceUnit = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

export interface RecurrenceSpec {
  /** First occurrence, 'YYYY-MM-DD'. May fall before the window. */
  startDate: string;
  /** The event's own last day, or null to run to the end of the window. */
  endDate: string | null;
  /** Repeat every N units. null (with unit null) means a one-time event. */
  interval: number | null;
  unit: RecurrenceUnit | null;
  /** Scenario window; occurrences outside it are discarded. */
  windowStart: string;
  windowEnd: string;
}

interface CivilDate {
  year: number;
  /** 1-12. */
  month: number;
  /** 1-31. */
  day: number;
}

/**
 * Guard against a non-terminating loop. Unreachable with a positive interval,
 * since occurrences increase monotonically and the loop stops once it passes the
 * end date — so hitting it means a logic error rather than unusual input, and it
 * throws rather than silently truncating the series.
 */
const MAX_OCCURRENCES = 50_000;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const DAYS_PER_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(year: number, month: number): number {
  return month === 2 && isLeapYear(year) ? 29 : DAYS_PER_MONTH[month - 1];
}

function parseDate(value: string, label: string): CivilDate {
  if (!DATE_PATTERN.test(value)) {
    throw new Error(`${label} must be formatted YYYY-MM-DD, received "${value}"`);
  }

  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));

  if (month < 1 || month > 12) {
    throw new Error(`${label} has an invalid month: "${value}"`);
  }
  if (day < 1 || day > daysInMonth(year, month)) {
    throw new Error(`${label} is not a real calendar date: "${value}"`);
  }

  return { year, month, day };
}

function formatDate({ year, month, day }: CivilDate): string {
  const yyyy = String(year).padStart(4, '0');
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Adds whole days, rolling over month and year boundaries. Called with small
 * steps only, so the loop runs a handful of times at most.
 */
function addDays(date: CivilDate, days: number): CivilDate {
  let { year, month, day } = date;
  day += days;

  while (day > daysInMonth(year, month)) {
    day -= daysInMonth(year, month);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return { year, month, day };
}

/**
 * Advances by whole months from the anchor, preserving the anchor's day-of-month
 * and clamping only where the target month is shorter. Computed from the anchor
 * rather than from the previous occurrence, which is what stops a clamped date
 * from permanently shifting the series earlier.
 */
function addMonthsAnchored(anchor: CivilDate, months: number): CivilDate {
  const monthIndex = anchor.year * 12 + (anchor.month - 1) + months;
  const year = Math.floor(monthIndex / 12);
  const month = (monthIndex % 12) + 1;
  return { year, month, day: Math.min(anchor.day, daysInMonth(year, month)) };
}

/**
 * Returns every date on which the event falls, ascending, clipped to the
 * scenario window and to the event's own end date.
 *
 * ISO dates are compared as strings throughout: zero-padded 'YYYY-MM-DD' sorts
 * lexicographically in the same order as chronologically.
 */
export function expandOccurrences(spec: RecurrenceSpec): string[] {
  const { startDate, endDate, interval, unit, windowStart, windowEnd } = spec;

  // Validate the shape even though the database enforces it, since a violation
  // here means a bug rather than bad user input.
  if ((interval === null) !== (unit === null)) {
    throw new Error(
      'recurrenceInterval and recurrenceUnit must both be set or both be null'
    );
  }

  parseDate(windowStart, 'windowStart');
  parseDate(windowEnd, 'windowEnd');
  const start = parseDate(startDate, 'startDate');
  if (endDate !== null) parseDate(endDate, 'endDate');

  if (windowEnd < windowStart) return [];

  // The series stops at whichever comes first: the event's own end or the
  // window's.
  const lastDate = endDate !== null && endDate < windowEnd ? endDate : windowEnd;
  if (startDate > lastDate) return [];

  // A one-time event is a single occurrence, included only if it lands inside
  // the window.
  if (interval === null || unit === null) {
    return startDate >= windowStart ? [startDate] : [];
  }

  if (!Number.isInteger(interval) || interval <= 0) {
    throw new Error(`recurrenceInterval must be a positive integer, received ${interval}`);
  }

  const occurrences: string[] = [];

  if (unit === 'DAY' || unit === 'WEEK') {
    // Day-based steps never clamp, so stepping from the previous occurrence is
    // identical to computing from the anchor — and keeps each step O(1).
    const step = unit === 'WEEK' ? interval * 7 : interval;
    let current = start;

    for (let i = 0; ; i += 1) {
      if (i >= MAX_OCCURRENCES) {
        throw new Error(`Recurrence produced more than ${MAX_OCCURRENCES} occurrences`);
      }

      const formatted = formatDate(current);
      if (formatted > lastDate) break;
      if (formatted >= windowStart) occurrences.push(formatted);
      current = addDays(current, step);
    }
  } else {
    // Month-based steps must be computed from the anchor, not stepped.
    const monthsPerStep = unit === 'YEAR' ? interval * 12 : interval;

    for (let n = 0; ; n += 1) {
      if (n >= MAX_OCCURRENCES) {
        throw new Error(`Recurrence produced more than ${MAX_OCCURRENCES} occurrences`);
      }

      const formatted = formatDate(addMonthsAnchored(start, n * monthsPerStep));
      if (formatted > lastDate) break;
      if (formatted >= windowStart) occurrences.push(formatted);
    }
  }

  return occurrences;
}

/**
 * How many times the event fires inside the window. The grid only needs the
 * count, but the dates have to be expanded to get it — clipping and clamping
 * both depend on the actual calendar.
 */
export function countOccurrences(spec: RecurrenceSpec): number {
  return expandOccurrences(spec).length;
}
