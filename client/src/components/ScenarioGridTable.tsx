import { Card, Table } from 'react-bootstrap';
import { formatEuro } from '../format';
import type { CategoryFieldsFragment, GridDataFieldsFragment } from '../graphql/generated';

interface ScenarioGridTableProps {
  title: string;
  subtitle?: string;
  /** Column headings, shared with the other grid on the page. */
  categories: CategoryFieldsFragment[];
  data: GridDataFieldsFragment;
}

function amountClass(amount: number): string {
  if (amount > 0) return 'text-success';
  if (amount < 0) return 'text-danger';
  return 'text-muted';
}

/**
 * One person × category grid, with a totals column and a totals row.
 *
 * Rendered twice per scenario — once for the baseline, once for the projection
 * — against the same `categories` array, which is what lets the two tables be
 * read side by side. Cells are looked up by `categoryId` rather than by
 * position, so a column heading can never end up over the wrong figures.
 */
export function ScenarioGridTable({
  title,
  subtitle,
  categories,
  data,
}: ScenarioGridTableProps) {
  if (categories.length === 0 || data.rows.length === 0) {
    return (
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>{title}</Card.Title>
          {subtitle && <Card.Subtitle className="text-muted mb-3">{subtitle}</Card.Subtitle>}
          <p className="text-muted mb-0">Nothing to show for the current filters.</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        {subtitle && <Card.Subtitle className="text-muted mb-3">{subtitle}</Card.Subtitle>}

        <div style={{ overflowX: 'auto' }}>
          <Table striped bordered hover size="sm" className="mb-0 transaction-amount">
            <thead>
              <tr>
                <th>Person</th>
                {categories.map((category) => (
                  <th key={category.id} style={{ textAlign: 'right' }}>
                    {category.name}
                  </th>
                ))}
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => {
                const byCategory = new Map(row.cells.map((cell) => [cell.categoryId, cell.amount]));
                return (
                  <tr key={row.person.id}>
                    <th scope="row">{row.person.name}</th>
                    {categories.map((category) => {
                      const amount = byCategory.get(category.id) ?? 0;
                      return (
                        <td
                          key={category.id}
                          style={{ textAlign: 'right' }}
                          className={amountClass(amount)}
                        >
                          {formatEuro(amount)}
                        </td>
                      );
                    })}
                    <td style={{ textAlign: 'right' }} className="fw-bold">
                      {formatEuro(row.total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="fw-bold">
                <th scope="row">Total</th>
                {categories.map((category, index) => (
                  <td key={category.id} style={{ textAlign: 'right' }}>
                    {formatEuro(data.columnTotals[index] ?? 0)}
                  </td>
                ))}
                <td style={{ textAlign: 'right' }}>{formatEuro(data.grandTotal)}</td>
              </tr>
            </tfoot>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
}
