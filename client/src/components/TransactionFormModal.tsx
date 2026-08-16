import { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import type {
  PersonFieldsFragment,
  CategoryFieldsFragment,
  TransactionFieldsFragment,
} from '../graphql/generated';

export interface TransactionFormValues {
  personId: string;
  categoryId: string;
  amount: number;
  description: string | null;
  occurredOn: string;
}

interface TransactionFormModalProps {
  show: boolean;
  /** The transaction being edited, or null when creating a new one. */
  editing: TransactionFieldsFragment | null;
  people: PersonFieldsFragment[];
  categories: CategoryFieldsFragment[];
  /** Error from the parent's mutation, shown alongside local validation errors. */
  submitError?: string;
  onSubmit: (values: TransactionFormValues) => void;
  onHide: () => void;
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Owns its own form state, initialised from `editing`. The parent is expected to
 * mount this with `key={editing?.id ?? 'new'}` so React remounts it whenever the
 * target changes — that keeps the useState initialisers authoritative and avoids
 * syncing props into state with useEffect.
 */
export function TransactionFormModal({
  show,
  editing,
  people,
  categories,
  submitError,
  onSubmit,
  onHide,
}: TransactionFormModalProps) {
  const [personId, setPersonId] = useState(editing?.person.id ?? '');
  const [categoryId, setCategoryId] = useState(editing?.category.id ?? '');
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [occurredOn, setOccurredOn] = useState(editing?.occurredOn ?? today());
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!personId || !categoryId || !amount) {
      setValidationError('Please fill in all required fields');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount === 0) {
      setValidationError('Amount must be a non-zero number');
      return;
    }

    setValidationError('');
    onSubmit({
      personId,
      categoryId,
      amount: parsedAmount,
      description: description || null,
      occurredOn,
    });
  };

  const error = validationError || submitError;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{editing ? 'Edit Transaction' : 'Add Transaction'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="transaction-person">
            <Form.Label>Person *</Form.Label>
            <Form.Select value={personId} onChange={(e) => setPersonId(e.target.value)} autoFocus>
              <option value="">Select person...</option>
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="transaction-category">
            <Form.Label>Category *</Form.Label>
            <Form.Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Select category...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="transaction-amount">
            <Form.Label>Amount (€ - positive for deposits, negative for withdrawals) *</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="transaction-date">
            <Form.Label>Date *</Form.Label>
            <Form.Control
              type="date"
              value={occurredOn}
              onChange={(e) => setOccurredOn(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="transaction-description">
            <Form.Label>Description (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {editing ? 'Update' : 'Create'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
