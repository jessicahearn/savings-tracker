import { describe, it, expect } from 'vitest';
import {
  buildScenarioGrid,
  type ScenarioGridInput,
  type GridEvent,
  type GridData,
} from '../scenarioGrid.js';

const ALICE = { id: 1, name: 'Alice' };
const BOB = { id: 2, name: 'Bob' };
const GROCERIES = { id: 10, name: 'Groceries' };
const SAVINGS = { id: 20, name: 'Savings' };

function input(overrides: Partial<ScenarioGridInput> = {}): ScenarioGridInput {
  return {
    window: { startDate: '2026-12-01', endDate: '2027-12-01' },
    balances: [],
    events: [],
    people: [ALICE, BOB],
    categories: [GROCERIES, SAVINGS],
    ...overrides,
  };
}

function monthly(overrides: Partial<GridEvent> = {}): GridEvent {
  return {
    personId: ALICE.id,
    categoryId: SAVINGS.id,
    amount: 100,
    startDate: '2026-12-01',
    endDate: null,
    recurrenceInterval: 1,
    recurrenceUnit: 'MONTH',
    ...overrides,
  };
}

function oneTime(overrides: Partial<GridEvent> = {}): GridEvent {
  return monthly({ recurrenceInterval: null, recurrenceUnit: null, ...overrides });
}

/** Reads one cell by person and category, so assertions stay legible. */
function cell(grid: GridData, personId: number, categoryId: number): number {
  const row = grid.rows.find((r) => r.personId === personId);
  return row?.cells.find((c) => c.categoryId === categoryId)?.amount ?? NaN;
}

describe('shape', () => {
  it('produces a cell for every person × category, defaulting to zero', () => {
    const grid = buildScenarioGrid(input());

    expect(grid.baseline.rows).toHaveLength(2);
    expect(grid.baseline.rows[0].cells).toHaveLength(2);
    expect(cell(grid.baseline, ALICE.id, GROCERIES.id)).toBe(0);
    expect(grid.baseline.grandTotal).toBe(0);
  });

  it('keeps rows and columns in the order supplied', () => {
    const grid = buildScenarioGrid(input({ people: [BOB, ALICE] }));

    expect(grid.people.map((p) => p.name)).toEqual(['Bob', 'Alice']);
    expect(grid.baseline.rows.map((r) => r.personId)).toEqual([BOB.id, ALICE.id]);
    expect(grid.baseline.rows[0].cells.map((c) => c.categoryId)).toEqual([
      GROCERIES.id,
      SAVINGS.id,
    ]);
  });

  it('gives both grids identical axes so they can be compared', () => {
    const grid = buildScenarioGrid(
      input({
        balances: [{ personId: ALICE.id, categoryId: GROCERIES.id, amount: 500 }],
        events: [monthly({ personId: BOB.id, categoryId: SAVINGS.id })],
      })
    );

    expect(grid.baseline.rows.map((r) => r.personId)).toEqual(
      grid.projected.rows.map((r) => r.personId)
    );
    expect(grid.baseline.columnTotals).toHaveLength(grid.projected.columnTotals.length);
  });

  it('tags each cell with its category id rather than relying on position', () => {
    const grid = buildScenarioGrid(input());
    expect(grid.baseline.rows[0].cells).toEqual([
      { categoryId: GROCERIES.id, amount: 0 },
      { categoryId: SAVINGS.id, amount: 0 },
    ]);
  });
});

describe('baseline', () => {
  it('places balances in the right cells', () => {
    const grid = buildScenarioGrid(
      input({
        balances: [
          { personId: ALICE.id, categoryId: GROCERIES.id, amount: 75 },
          { personId: ALICE.id, categoryId: SAVINGS.id, amount: 500 },
          { personId: BOB.id, categoryId: SAVINGS.id, amount: 100 },
        ],
      })
    );

    expect(cell(grid.baseline, ALICE.id, GROCERIES.id)).toBe(75);
    expect(cell(grid.baseline, ALICE.id, SAVINGS.id)).toBe(500);
    expect(cell(grid.baseline, BOB.id, SAVINGS.id)).toBe(100);
    expect(cell(grid.baseline, BOB.id, GROCERIES.id)).toBe(0);
  });

  it('carries negative balances through', () => {
    const grid = buildScenarioGrid(
      input({ balances: [{ personId: ALICE.id, categoryId: SAVINGS.id, amount: -45.5 }] })
    );
    expect(cell(grid.baseline, ALICE.id, SAVINGS.id)).toBe(-45.5);
  });

  it('ignores balances for people or categories outside the axes', () => {
    // A person removed from the account can still own historical transactions;
    // the caller decides the axes, and anything off them is not rendered.
    const grid = buildScenarioGrid(
      input({
        balances: [
          { personId: 999, categoryId: SAVINGS.id, amount: 1000 },
          { personId: ALICE.id, categoryId: 888, amount: 2000 },
        ],
      })
    );

    expect(grid.baseline.grandTotal).toBe(0);
  });

  it('leaves the baseline untouched by events', () => {
    const grid = buildScenarioGrid(
      input({
        balances: [{ personId: ALICE.id, categoryId: SAVINGS.id, amount: 500 }],
        events: [monthly()],
      })
    );

    expect(cell(grid.baseline, ALICE.id, SAVINGS.id)).toBe(500);
    expect(grid.baseline.grandTotal).toBe(500);
  });
});

describe('projection', () => {
  it('adds a monthly event across an inclusive window — 13 hits, not 12', () => {
    // The arithmetic from the plan: Dec 2026 through Dec 2027 at €100/month.
    const grid = buildScenarioGrid(
      input({
        balances: [{ personId: ALICE.id, categoryId: SAVINGS.id, amount: 500 }],
        events: [monthly({ amount: 100 })],
      })
    );

    expect(cell(grid.projected, ALICE.id, SAVINGS.id)).toBe(1800);
    expect(grid.projected.grandTotal - grid.baseline.grandTotal).toBe(1300);
  });

  it('adds a one-time event exactly once', () => {
    const grid = buildScenarioGrid(
      input({ events: [oneTime({ amount: 250, startDate: '2027-03-15' })] })
    );
    expect(cell(grid.projected, ALICE.id, SAVINGS.id)).toBe(250);
  });

  it('subtracts recurring withdrawals', () => {
    const grid = buildScenarioGrid(
      input({
        balances: [{ personId: ALICE.id, categoryId: SAVINGS.id, amount: 5000 }],
        events: [monthly({ amount: -200 })],
      })
    );
    // 5000 - (200 × 13)
    expect(cell(grid.projected, ALICE.id, SAVINGS.id)).toBe(2400);
  });

  it('accumulates several events into one cell', () => {
    const grid = buildScenarioGrid(
      input({
        events: [
          monthly({ amount: 100 }),
          oneTime({ amount: 50, startDate: '2027-01-01' }),
        ],
      })
    );
    expect(cell(grid.projected, ALICE.id, SAVINGS.id)).toBe(1350);
  });

  it('keeps events in their own person and category cells', () => {
    const grid = buildScenarioGrid(
      input({
        events: [
          monthly({ personId: ALICE.id, categoryId: SAVINGS.id, amount: 100 }),
          oneTime({ personId: BOB.id, categoryId: GROCERIES.id, amount: 70 }),
        ],
      })
    );

    expect(cell(grid.projected, ALICE.id, SAVINGS.id)).toBe(1300);
    expect(cell(grid.projected, BOB.id, GROCERIES.id)).toBe(70);
    expect(cell(grid.projected, ALICE.id, GROCERIES.id)).toBe(0);
    expect(cell(grid.projected, BOB.id, SAVINGS.id)).toBe(0);
  });

  it('respects an event end date that falls inside the window', () => {
    const grid = buildScenarioGrid(
      input({ events: [monthly({ amount: 100, endDate: '2027-02-01' })] })
    );
    // Dec, Jan, Feb only.
    expect(cell(grid.projected, ALICE.id, SAVINGS.id)).toBe(300);
  });

  it('ignores events falling entirely outside the window', () => {
    const grid = buildScenarioGrid(
      input({ events: [oneTime({ amount: 999, startDate: '2030-01-01' })] })
    );
    expect(grid.projected.grandTotal).toBe(0);
  });

  it('counts only the in-window part of an event that started earlier', () => {
    const grid = buildScenarioGrid(
      input({ events: [monthly({ amount: 100, startDate: '2020-01-01' })] })
    );
    // Still 13 hits inside Dec 2026 – Dec 2027, aligned to the original day.
    expect(cell(grid.projected, ALICE.id, SAVINGS.id)).toBe(1300);
  });

  it('ignores events for people or categories outside the axes', () => {
    const grid = buildScenarioGrid(
      input({ events: [monthly({ personId: 999, amount: 100 })] })
    );
    expect(grid.projected.grandTotal).toBe(0);
  });

  it('matches the baseline when there are no events', () => {
    const grid = buildScenarioGrid(
      input({ balances: [{ personId: BOB.id, categoryId: GROCERIES.id, amount: 42 }] })
    );
    expect(grid.projected).toEqual(grid.baseline);
  });
});

describe('totals', () => {
  it('sums rows, columns and the grand total consistently', () => {
    const grid = buildScenarioGrid(
      input({
        balances: [
          { personId: ALICE.id, categoryId: GROCERIES.id, amount: 10 },
          { personId: ALICE.id, categoryId: SAVINGS.id, amount: 20 },
          { personId: BOB.id, categoryId: GROCERIES.id, amount: 30 },
          { personId: BOB.id, categoryId: SAVINGS.id, amount: 40 },
        ],
      })
    );

    expect(grid.baseline.rows[0].total).toBe(30);
    expect(grid.baseline.rows[1].total).toBe(70);
    expect(grid.baseline.columnTotals).toEqual([40, 60]);
    expect(grid.baseline.grandTotal).toBe(100);
  });

  it('agrees whether totalled by row or by column', () => {
    const grid = buildScenarioGrid(
      input({
        balances: [
          { personId: ALICE.id, categoryId: GROCERIES.id, amount: 33.33 },
          { personId: BOB.id, categoryId: SAVINGS.id, amount: 66.67 },
        ],
        events: [monthly({ amount: 12.34 })],
      })
    );

    for (const grid_ of [grid.baseline, grid.projected]) {
      const byRow = grid_.rows.reduce((sum, r) => sum + r.total, 0);
      const byColumn = grid_.columnTotals.reduce((sum, c) => sum + c, 0);
      expect(Math.round(byRow * 100) / 100).toBe(grid_.grandTotal);
      expect(Math.round(byColumn * 100) / 100).toBe(grid_.grandTotal);
    }
  });

  it('makes each row total equal the sum of its own displayed cells', () => {
    // Guards the decision to total the rounded cells rather than full-precision
    // intermediates: a table whose visible figures do not add up is a bug.
    const grid = buildScenarioGrid(
      input({
        balances: [
          { personId: ALICE.id, categoryId: GROCERIES.id, amount: 0.005 },
          { personId: ALICE.id, categoryId: SAVINGS.id, amount: 0.005 },
        ],
      })
    );

    const row = grid.baseline.rows[0];
    const sumOfCells = row.cells.reduce((sum, c) => sum + c.amount, 0);
    expect(row.total).toBe(Math.round(sumOfCells * 100) / 100);
  });

  it('keeps repeated addition free of float noise', () => {
    const grid = buildScenarioGrid(
      input({ events: [monthly({ amount: 0.1 })] })
    );
    // 0.1 × 13 is 1.3000000000000003 in raw float arithmetic.
    expect(cell(grid.projected, ALICE.id, SAVINGS.id)).toBe(1.3);
  });

  it('handles negative grand totals', () => {
    const grid = buildScenarioGrid(
      input({ events: [monthly({ amount: -100 })] })
    );
    expect(grid.projected.grandTotal).toBe(-1300);
  });
});

describe('filtering', () => {
  const populated = {
    balances: [
      { personId: ALICE.id, categoryId: GROCERIES.id, amount: 10 },
      { personId: ALICE.id, categoryId: SAVINGS.id, amount: 20 },
      { personId: BOB.id, categoryId: GROCERIES.id, amount: 30 },
      { personId: BOB.id, categoryId: SAVINGS.id, amount: 40 },
    ],
    events: [
      monthly({ personId: ALICE.id, categoryId: SAVINGS.id, amount: 100 }),
      monthly({ personId: BOB.id, categoryId: GROCERIES.id, amount: 200 }),
    ],
  };

  it('narrows the rows when filtering by person', () => {
    const grid = buildScenarioGrid(input({ ...populated, filter: { personIds: [ALICE.id] } }));

    expect(grid.people).toEqual([ALICE]);
    expect(grid.baseline.rows).toHaveLength(1);
    expect(grid.baseline.grandTotal).toBe(30);
    // Bob's event is excluded along with his row.
    expect(grid.projected.grandTotal).toBe(30 + 1300);
  });

  it('narrows the columns when filtering by category', () => {
    const grid = buildScenarioGrid(
      input({ ...populated, filter: { categoryIds: [GROCERIES.id] } })
    );

    expect(grid.categories).toEqual([GROCERIES]);
    expect(grid.baseline.rows[0].cells).toHaveLength(1);
    expect(grid.baseline.grandTotal).toBe(40);
    expect(grid.projected.grandTotal).toBe(40 + 2600);
  });

  it('applies both filters together', () => {
    const grid = buildScenarioGrid(
      input({ ...populated, filter: { personIds: [BOB.id], categoryIds: [SAVINGS.id] } })
    );

    expect(grid.baseline.grandTotal).toBe(40);
    // Bob has no Savings event, so the projection matches the baseline.
    expect(grid.projected.grandTotal).toBe(40);
  });

  it('applies the same filter to both grids', () => {
    const grid = buildScenarioGrid(input({ ...populated, filter: { personIds: [ALICE.id] } }));
    expect(grid.baseline.rows.map((r) => r.personId)).toEqual(
      grid.projected.rows.map((r) => r.personId)
    );
  });

  it('treats empty filter arrays as no restriction', () => {
    const unfiltered = buildScenarioGrid(input(populated));
    const empty = buildScenarioGrid(
      input({ ...populated, filter: { personIds: [], categoryIds: [] } })
    );
    expect(empty).toEqual(unfiltered);
  });

  it('produces an empty grid when the filter matches nothing', () => {
    const grid = buildScenarioGrid(input({ ...populated, filter: { personIds: [999] } }));

    expect(grid.people).toEqual([]);
    expect(grid.baseline.rows).toEqual([]);
    expect(grid.baseline.grandTotal).toBe(0);
    expect(grid.projected.grandTotal).toBe(0);
  });
});
