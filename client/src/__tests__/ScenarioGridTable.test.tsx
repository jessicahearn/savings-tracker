import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScenarioGridTable } from '../components/ScenarioGridTable';
import type { CategoryFieldsFragment, GridDataFieldsFragment } from '../graphql/generated';

const CUSHION: CategoryFieldsFragment = { id: '10', name: 'Cushion', createdAt: '2026-01-01' };
const TRAVEL: CategoryFieldsFragment = { id: '20', name: 'Travel', createdAt: '2026-01-01' };
const categories = [CUSHION, TRAVEL];

const JESS = { id: '1', name: 'Jess', createdAt: '2026-01-01' };
const GABI = { id: '2', name: 'Gabi', createdAt: '2026-01-01' };

function gridData(overrides: Partial<GridDataFieldsFragment> = {}): GridDataFieldsFragment {
  return {
    rows: [
      {
        person: JESS,
        cells: [
          { categoryId: CUSHION.id, amount: 6980 },
          { categoryId: TRAVEL.id, amount: 0 },
        ],
        total: 6980,
      },
      {
        person: GABI,
        cells: [
          { categoryId: CUSHION.id, amount: 0 },
          { categoryId: TRAVEL.id, amount: -250 },
        ],
        total: -250,
      },
    ],
    columnTotals: [6980, -250],
    grandTotal: 6730,
    ...overrides,
  };
}

/** The cells of one body row, in rendered order. */
function rowCells(personName: string): string[] {
  const header = screen.getByRole('rowheader', { name: personName });
  const row = header.closest('tr')!;
  return Array.from(row.querySelectorAll('td')).map((td) => td.textContent ?? '');
}

describe('rendering', () => {
  it('shows the title and optional subtitle', () => {
    render(
      <ScenarioGridTable
        title="Projected position"
        subtitle="by 2027-12-01"
        categories={categories}
        data={gridData()}
      />
    );

    expect(screen.getByText('Projected position')).toBeTruthy();
    expect(screen.getByText('by 2027-12-01')).toBeTruthy();
  });

  it('omits the subtitle when not given', () => {
    render(<ScenarioGridTable title="Starting position" categories={categories} data={gridData()} />);
    expect(screen.queryByText('by 2027-12-01')).toBeNull();
  });

  it('renders a column heading per category, plus Person and Total', () => {
    render(<ScenarioGridTable title="Grid" categories={categories} data={gridData()} />);

    expect(screen.getByRole('columnheader', { name: 'Person' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Cushion' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Travel' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Total' })).toBeTruthy();
  });

  it('renders one row per person, with the name as a row header', () => {
    render(<ScenarioGridTable title="Grid" categories={categories} data={gridData()} />);

    expect(screen.getByRole('rowheader', { name: 'Jess' })).toBeTruthy();
    expect(screen.getByRole('rowheader', { name: 'Gabi' })).toBeTruthy();
  });

  it('formats every figure as euros', () => {
    render(<ScenarioGridTable title="Grid" categories={categories} data={gridData()} />);

    expect(rowCells('Jess')).toEqual(['€6,980.00', '€0.00', '€6,980.00']);
    expect(rowCells('Gabi')).toEqual(['€0.00', '-€250.00', '-€250.00']);
  });
});

describe('cell placement', () => {
  it('places each amount under its own category, not by array position', () => {
    // Cells deliberately supplied in the opposite order to the categories. A
    // positional renderer would file 6980 under Travel and -250 under Cushion.
    render(
      <ScenarioGridTable
        title="Grid"
        categories={categories}
        data={{
          rows: [
            {
              person: JESS,
              cells: [
                { categoryId: TRAVEL.id, amount: -250 },
                { categoryId: CUSHION.id, amount: 6980 },
              ],
              total: 6730,
            },
          ],
          columnTotals: [6980, -250],
          grandTotal: 6730,
        }}
      />
    );

    expect(rowCells('Jess')).toEqual(['€6,980.00', '-€250.00', '€6,730.00']);
  });

  it('shows zero for a category the row has no cell for', () => {
    render(
      <ScenarioGridTable
        title="Grid"
        categories={categories}
        data={{
          rows: [
            { person: JESS, cells: [{ categoryId: CUSHION.id, amount: 500 }], total: 500 },
          ],
          columnTotals: [500, 0],
          grandTotal: 500,
        }}
      />
    );

    expect(rowCells('Jess')).toEqual(['€500.00', '€0.00', '€500.00']);
  });
});

describe('totals row', () => {
  it('renders column totals aligned to the categories, then the grand total', () => {
    render(<ScenarioGridTable title="Grid" categories={categories} data={gridData()} />);

    const totalHeader = screen.getByRole('rowheader', { name: 'Total' });
    const cells = Array.from(totalHeader.closest('tr')!.querySelectorAll('td')).map(
      (td) => td.textContent
    );
    expect(cells).toEqual(['€6,980.00', '-€250.00', '€6,730.00']);
  });

  it('falls back to zero for a missing column total', () => {
    render(
      <ScenarioGridTable
        title="Grid"
        categories={categories}
        data={gridData({ columnTotals: [6980] })}
      />
    );

    const totalHeader = screen.getByRole('rowheader', { name: 'Total' });
    const cells = Array.from(totalHeader.closest('tr')!.querySelectorAll('td')).map(
      (td) => td.textContent
    );
    expect(cells).toEqual(['€6,980.00', '€0.00', '€6,730.00']);
  });
});

describe('amount styling', () => {
  it('colours positive, negative and zero differently', () => {
    render(<ScenarioGridTable title="Grid" categories={categories} data={gridData()} />);

    const jess = screen.getByRole('rowheader', { name: 'Jess' }).closest('tr')!;
    const gabi = screen.getByRole('rowheader', { name: 'Gabi' }).closest('tr')!;

    expect(jess.querySelectorAll('td')[0].className).toContain('text-success');
    expect(jess.querySelectorAll('td')[1].className).toContain('text-muted');
    expect(gabi.querySelectorAll('td')[1].className).toContain('text-danger');
  });
});

describe('empty states', () => {
  it('shows a message instead of a table when there are no categories', () => {
    render(
      <ScenarioGridTable
        title="Starting position"
        categories={[]}
        data={{ rows: [], columnTotals: [], grandTotal: 0 }}
      />
    );

    expect(screen.getByText(/Nothing to show for the current filters/)).toBeTruthy();
    expect(screen.queryByRole('table')).toBeNull();
    // The title still shows, so the page keeps its structure under a filter
    // that excludes everything.
    expect(screen.getByText('Starting position')).toBeTruthy();
  });

  it('shows a message when there are categories but no rows', () => {
    render(
      <ScenarioGridTable
        title="Grid"
        categories={categories}
        data={{ rows: [], columnTotals: [0, 0], grandTotal: 0 }}
      />
    );

    expect(screen.getByText(/Nothing to show for the current filters/)).toBeTruthy();
    expect(screen.queryByRole('table')).toBeNull();
  });
});
