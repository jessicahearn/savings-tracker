/**
 * Builds the two person × category grids shown on a scenario page: the account
 * as it stands on the scenario's start date, and the projection if every event
 * occurs.
 *
 * Pure, like everything in `src/lib/` — the balances arrive already fetched, and
 * recurrence expansion is delegated to ./recurrence.js. That means the entire
 * baseline-to-projection calculation can be tested with plain function calls,
 * and the resolver is left with nothing but fetch, call, map.
 *
 * Two conventions worth knowing:
 *
 *  - **Both grids share one pair of axes.** Comparing a before and after table
 *    only works if the rows and columns line up, so the caller supplies the
 *    candidate people and categories and both grids are built over the same
 *    (filtered) set.
 *
 *  - **Totals are summed from the rounded cells**, not from full-precision
 *    intermediates. In a financial table the figures on screen have to add up to
 *    the total on screen; summing first and rounding afterwards can leave a
 *    column that visibly disagrees with its own entries by a cent.
 */
import { countOccurrences, type RecurrenceUnit } from './recurrence.js';

/** A row or column heading. */
export interface GridAxisItem {
  id: number;
  name: string;
}

/** A balance already fetched from the database, in the schema's vocabulary. */
export interface GridBalance {
  personId: number;
  categoryId: number;
  amount: number;
}

/** A scenario event, with everything needed to expand its recurrence. */
export interface GridEvent {
  personId: number;
  categoryId: number;
  amount: number;
  startDate: string;
  endDate: string | null;
  recurrenceInterval: number | null;
  recurrenceUnit: RecurrenceUnit | null;
}

export interface GridFilter {
  personIds?: number[];
  categoryIds?: number[];
}

export interface ScenarioGridInput {
  /** The scenario's own date range; events are clipped to it. */
  window: { startDate: string; endDate: string };
  /** Running balances as at window.startDate, from getBalancesByPersonCategory. */
  balances: GridBalance[];
  events: GridEvent[];
  /** Candidate rows and columns, in the order they should be displayed. */
  people: GridAxisItem[];
  categories: GridAxisItem[];
  filter?: GridFilter;
}

export interface GridCell {
  categoryId: number;
  amount: number;
}

export interface GridRow {
  personId: number;
  cells: GridCell[];
  total: number;
}

export interface GridData {
  rows: GridRow[];
  /** Aligned to the shared `categories` axis. */
  columnTotals: number[];
  grandTotal: number;
}

export interface ScenarioGrid {
  people: GridAxisItem[];
  categories: GridAxisItem[];
  baseline: GridData;
  projected: GridData;
}

/** Money, to the cent. Keeps float addition noise out of the UI. */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function cellKey(personId: number, categoryId: number): string {
  return `${personId}:${categoryId}`;
}

/**
 * An empty or absent id list means "no restriction", matching the SQL filter in
 * transactionsRepo.applyFilter.
 */
function allows(ids: number[] | undefined, id: number): boolean {
  return !ids || ids.length === 0 || ids.includes(id);
}

function buildGridData(
  amounts: Map<string, number>,
  people: GridAxisItem[],
  categories: GridAxisItem[]
): GridData {
  const columnTotals = categories.map(() => 0);
  let grandTotal = 0;

  const rows: GridRow[] = people.map((person) => {
    let rowTotal = 0;

    const cells: GridCell[] = categories.map((category, columnIndex) => {
      // Rounded here, then only rounded values are summed, so the table adds up.
      const amount = round2(amounts.get(cellKey(person.id, category.id)) ?? 0);
      rowTotal += amount;
      columnTotals[columnIndex] += amount;
      return { categoryId: category.id, amount };
    });

    const total = round2(rowTotal);
    grandTotal += total;

    return { personId: person.id, cells, total };
  });

  return {
    rows,
    columnTotals: columnTotals.map(round2),
    grandTotal: round2(grandTotal),
  };
}

export function buildScenarioGrid(input: ScenarioGridInput): ScenarioGrid {
  const { window, balances, events, filter } = input;

  // Axes first: both grids are built over exactly these, so a person or
  // category excluded by the filter contributes to neither.
  const people = input.people.filter((p) => allows(filter?.personIds, p.id));
  const categories = input.categories.filter((c) => allows(filter?.categoryIds, c.id));

  const inAxes = (personId: number, categoryId: number): boolean =>
    people.some((p) => p.id === personId) && categories.some((c) => c.id === categoryId);

  // The balances were filtered in SQL already; re-checking here is idempotent
  // and means the grid cannot disagree with its own axes.
  const baselineAmounts = new Map<string, number>();
  for (const balance of balances) {
    if (!inAxes(balance.personId, balance.categoryId)) continue;
    const key = cellKey(balance.personId, balance.categoryId);
    baselineAmounts.set(key, (baselineAmounts.get(key) ?? 0) + balance.amount);
  }

  // The projection starts from the baseline and adds each event's total effect
  // over the window.
  const projectedAmounts = new Map(baselineAmounts);
  for (const event of events) {
    if (!inAxes(event.personId, event.categoryId)) continue;

    const occurrences = countOccurrences({
      startDate: event.startDate,
      endDate: event.endDate,
      interval: event.recurrenceInterval,
      unit: event.recurrenceUnit,
      windowStart: window.startDate,
      windowEnd: window.endDate,
    });

    if (occurrences === 0) continue;

    const key = cellKey(event.personId, event.categoryId);
    projectedAmounts.set(key, (projectedAmounts.get(key) ?? 0) + event.amount * occurrences);
  }

  return {
    people,
    categories,
    baseline: buildGridData(baselineAmounts, people, categories),
    projected: buildGridData(projectedAmounts, people, categories),
  };
}
