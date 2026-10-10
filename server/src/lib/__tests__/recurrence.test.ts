import { describe, it, expect } from 'vitest';
import {
  expandOccurrences,
  countOccurrences,
  type RecurrenceSpec,
  type RecurrenceUnit,
} from '../recurrence.js';

/** A full-year window, so most tests only vary the recurrence itself. */
function spec(overrides: Partial<RecurrenceSpec> = {}): RecurrenceSpec {
  return {
    startDate: '2026-01-01',
    endDate: null,
    interval: null,
    unit: null,
    windowStart: '2026-01-01',
    windowEnd: '2026-12-31',
    ...overrides,
  };
}

function recurring(
  startDate: string,
  interval: number,
  unit: RecurrenceUnit,
  overrides: Partial<RecurrenceSpec> = {}
): RecurrenceSpec {
  return spec({ startDate, interval, unit, ...overrides });
}

describe('one-time events', () => {
  it('returns the single date when it falls inside the window', () => {
    expect(expandOccurrences(spec({ startDate: '2026-06-15' }))).toEqual(['2026-06-15']);
  });

  it('returns nothing when it falls before the window', () => {
    expect(
      expandOccurrences(spec({ startDate: '2025-06-15', windowStart: '2026-01-01' }))
    ).toEqual([]);
  });

  it('returns nothing when it falls after the window', () => {
    expect(
      expandOccurrences(spec({ startDate: '2027-06-15', windowEnd: '2026-12-31' }))
    ).toEqual([]);
  });

  it('includes an event on the window boundaries', () => {
    expect(expandOccurrences(spec({ startDate: '2026-01-01' }))).toEqual(['2026-01-01']);
    expect(expandOccurrences(spec({ startDate: '2026-12-31' }))).toEqual(['2026-12-31']);
  });
});

describe('monthly recurrence — day-of-month anchoring', () => {
  it('keeps the 31st as the anchor, clamping only short months', () => {
    // The whole reason this logic is not left to Postgres generate_series,
    // which would drift to the 28th from February onwards and never recover.
    expect(
      expandOccurrences(recurring('2026-01-31', 1, 'MONTH', { windowEnd: '2026-06-30' }))
    ).toEqual([
      '2026-01-31',
      '2026-02-28',
      '2026-03-31',
      '2026-04-30',
      '2026-05-31',
      '2026-06-30',
    ]);
  });

  it('clamps the 30th in February only', () => {
    expect(
      expandOccurrences(recurring('2026-01-30', 1, 'MONTH', { windowEnd: '2026-04-30' }))
    ).toEqual(['2026-01-30', '2026-02-28', '2026-03-30', '2026-04-30']);
  });

  it('uses February 29 in a leap year', () => {
    expect(
      expandOccurrences(
        recurring('2028-01-31', 1, 'MONTH', {
          windowStart: '2028-01-01',
          windowEnd: '2028-03-31',
        })
      )
    ).toEqual(['2028-01-31', '2028-02-29', '2028-03-31']);
  });

  it('never clamps a day that every month has', () => {
    expect(
      expandOccurrences(recurring('2026-01-15', 1, 'MONTH', { windowEnd: '2026-04-30' }))
    ).toEqual(['2026-01-15', '2026-02-15', '2026-03-15', '2026-04-15']);
  });

  it('honours an interval greater than one', () => {
    expect(expandOccurrences(recurring('2026-01-31', 3, 'MONTH'))).toEqual([
      '2026-01-31',
      '2026-04-30',
      '2026-07-31',
      '2026-10-31',
    ]);
  });

  it('crosses a year boundary', () => {
    expect(
      expandOccurrences(
        recurring('2026-11-30', 1, 'MONTH', { windowEnd: '2027-02-28' })
      )
    ).toEqual(['2026-11-30', '2026-12-30', '2027-01-30', '2027-02-28']);
  });
});

describe('yearly recurrence', () => {
  it('repeats on the same day each year', () => {
    expect(
      expandOccurrences(
        recurring('2026-03-10', 1, 'YEAR', { windowEnd: '2029-12-31' })
      )
    ).toEqual(['2026-03-10', '2027-03-10', '2028-03-10', '2029-03-10']);
  });

  it('clamps February 29 to the 28th in non-leap years but recovers', () => {
    expect(
      expandOccurrences(
        recurring('2028-02-29', 1, 'YEAR', {
          windowStart: '2028-01-01',
          windowEnd: '2032-12-31',
        })
      )
    ).toEqual(['2028-02-29', '2029-02-28', '2030-02-28', '2031-02-28', '2032-02-29']);
  });
});

describe('daily and weekly recurrence', () => {
  it('steps by single days across a month boundary', () => {
    expect(
      expandOccurrences(
        recurring('2026-01-30', 1, 'DAY', {
          windowStart: '2026-01-01',
          windowEnd: '2026-02-02',
        })
      )
    ).toEqual(['2026-01-30', '2026-01-31', '2026-02-01', '2026-02-02']);
  });

  it('steps by a multi-day interval', () => {
    expect(
      expandOccurrences(
        recurring('2026-01-01', 10, 'DAY', { windowEnd: '2026-02-01' })
      )
    ).toEqual(['2026-01-01', '2026-01-11', '2026-01-21', '2026-01-31']);
  });

  it('steps weekly, landing on the same weekday', () => {
    expect(
      expandOccurrences(
        recurring('2026-01-05', 1, 'WEEK', { windowEnd: '2026-02-05' })
      )
    ).toEqual(['2026-01-05', '2026-01-12', '2026-01-19', '2026-01-26', '2026-02-02']);
  });

  it('steps fortnightly', () => {
    expect(
      expandOccurrences(
        recurring('2026-01-05', 2, 'WEEK', { windowEnd: '2026-03-05' })
      )
    ).toEqual(['2026-01-05', '2026-01-19', '2026-02-02', '2026-02-16', '2026-03-02']);
  });

  it('crosses a leap day correctly', () => {
    expect(
      expandOccurrences(
        recurring('2028-02-27', 1, 'DAY', {
          windowStart: '2028-01-01',
          windowEnd: '2028-03-01',
        })
      )
    ).toEqual(['2028-02-27', '2028-02-28', '2028-02-29', '2028-03-01']);
  });
});

describe('clipping', () => {
  it('drops occurrences before the window but keeps the anchor alignment', () => {
    // Started in 2025; the window only sees 2026, and the day-of-month is still
    // taken from the original start date.
    expect(
      expandOccurrences(
        recurring('2025-03-31', 1, 'MONTH', {
          windowStart: '2026-01-01',
          windowEnd: '2026-04-30',
        })
      )
    ).toEqual(['2026-01-31', '2026-02-28', '2026-03-31', '2026-04-30']);
  });

  it('stops at the event end date when it precedes the window end', () => {
    expect(
      expandOccurrences(
        recurring('2026-01-15', 1, 'MONTH', { endDate: '2026-03-31' })
      )
    ).toEqual(['2026-01-15', '2026-02-15', '2026-03-15']);
  });

  it('stops at the window end when it precedes the event end date', () => {
    expect(
      expandOccurrences(
        recurring('2026-01-15', 1, 'MONTH', {
          endDate: '2030-12-31',
          windowEnd: '2026-03-31',
        })
      )
    ).toEqual(['2026-01-15', '2026-02-15', '2026-03-15']);
  });

  it('includes an occurrence falling exactly on the event end date', () => {
    expect(
      expandOccurrences(
        recurring('2026-01-15', 1, 'MONTH', { endDate: '2026-03-15' })
      )
    ).toEqual(['2026-01-15', '2026-02-15', '2026-03-15']);
  });

  it('returns nothing when the event starts after the window closes', () => {
    expect(
      expandOccurrences(recurring('2027-01-01', 1, 'MONTH', { windowEnd: '2026-12-31' }))
    ).toEqual([]);
  });

  it('returns nothing for an inverted window', () => {
    expect(
      expandOccurrences(
        recurring('2026-01-01', 1, 'MONTH', {
          windowStart: '2026-12-31',
          windowEnd: '2026-01-01',
        })
      )
    ).toEqual([]);
  });

  it('handles a single-day window', () => {
    expect(
      expandOccurrences(
        recurring('2026-06-15', 1, 'DAY', {
          windowStart: '2026-06-15',
          windowEnd: '2026-06-15',
        })
      )
    ).toEqual(['2026-06-15']);
  });
});

describe('countOccurrences', () => {
  it('counts 13 monthly occurrences across an inclusive 12-month window', () => {
    // The arithmetic the plan calls out: Dec 2026 through Dec 2027 inclusive is
    // 13 hits, not 12. A €100 monthly event should move the projection by €1,300.
    expect(
      countOccurrences(
        recurring('2026-12-01', 1, 'MONTH', {
          windowStart: '2026-12-01',
          windowEnd: '2027-12-01',
        })
      )
    ).toBe(13);
  });

  it('counts a one-time event as one', () => {
    expect(countOccurrences(spec({ startDate: '2026-05-05' }))).toBe(1);
  });

  it('counts zero when nothing lands in the window', () => {
    expect(countOccurrences(spec({ startDate: '2030-05-05' }))).toBe(0);
  });
});

describe('input validation', () => {
  it('rejects an interval without a unit', () => {
    expect(() => expandOccurrences(spec({ interval: 1, unit: null }))).toThrow(
      /both be set or both be null/
    );
  });

  it('rejects a unit without an interval', () => {
    expect(() => expandOccurrences(spec({ interval: null, unit: 'MONTH' }))).toThrow(
      /both be set or both be null/
    );
  });

  it('rejects a zero or negative interval', () => {
    expect(() => expandOccurrences(recurring('2026-01-01', 0, 'MONTH'))).toThrow(
      /positive integer/
    );
    expect(() => expandOccurrences(recurring('2026-01-01', -1, 'MONTH'))).toThrow(
      /positive integer/
    );
  });

  it('rejects a malformed date', () => {
    expect(() => expandOccurrences(spec({ startDate: '2026-1-1' }))).toThrow(
      /YYYY-MM-DD/
    );
  });

  it('rejects a date that is not on the calendar', () => {
    expect(() => expandOccurrences(spec({ startDate: '2026-02-30' }))).toThrow(
      /not a real calendar date/
    );
    // 2026 is not a leap year.
    expect(() => expandOccurrences(spec({ startDate: '2026-02-29' }))).toThrow(
      /not a real calendar date/
    );
  });

  it('accepts February 29 in a leap year', () => {
    expect(
      expandOccurrences(
        spec({ startDate: '2028-02-29', windowStart: '2028-01-01', windowEnd: '2028-12-31' })
      )
    ).toEqual(['2028-02-29']);
  });
});
