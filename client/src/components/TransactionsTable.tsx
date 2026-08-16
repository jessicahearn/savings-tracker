import { Table, Button } from 'react-bootstrap';
import type { TransactionFieldsFragment } from '../graphql/generated';

interface TransactionsTableProps {
  transactions: TransactionFieldsFragment[];
  onEdit: (transaction: TransactionFieldsFragment) => void;
  onDelete: (id: string) => void;
}

function formatAmount(amount: number): string {
  const sign = amount >= 0 ? '+' : '-';
  return `${sign}$${Math.abs(amount).toFixed(2)}`;
}

export function TransactionsTable({ transactions, onEdit, onDelete }: TransactionsTableProps) {
  if (transactions.length === 0) {
    return <p className="text-muted">No transactions yet.</p>;
  }

  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Date</th>
          <th>Person</th>
          <th>Category</th>
          <th style={{ textAlign: 'right' }}>Amount</th>
          <th>Description</th>
          <th style={{ width: '180px' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((t) => (
          <tr key={t.id}>
            <td>{t.occurredOn}</td>
            <td>{t.person.name}</td>
            <td>{t.category.name}</td>
            <td style={{ textAlign: 'right' }}>
              <span className={t.amount >= 0 ? 'text-success' : 'text-danger'}>
                {formatAmount(t.amount)}
              </span>
            </td>
            <td>{t.description || '—'}</td>
            <td>
              <Button variant="secondary" size="sm" className="me-2" onClick={() => onEdit(t)}>
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => onDelete(t.id)}>
                Delete
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
