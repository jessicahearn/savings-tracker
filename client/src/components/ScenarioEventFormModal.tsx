import { useState } from 'react';
import { Modal, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import type {
  PersonFieldsFragment,
  CategoryFieldsFragment,
  ScenarioEventFieldsFragment,
  RecurrenceUnit,
} from '../graphql/generated';

export interface ScenarioEventFormValues {
  personId: string;
  categoryId: string;
  amount: number;
  description: string | null;
  startDate: string;
  endDate: string | null;
  recurrenceInterval: number | null;
  recurrenceUnit: RecurrenceUnit | null;
}

interface ScenarioEventFormModalProps {
  show: boolean;
  /** The event being edited, or null when adding. */
  editing: ScenarioEventFieldsFragment | null;
  people: PersonFieldsFragment[];
  categories: CategoryFieldsFragment[];
  /** The scenario's window, shown as guidance and used to default the date. */
  scenarioStart: string;
  scenarioEnd: string;
  submitError?: string;
  onSubmit: (values: ScenarioEventFormValues) => void;
  onHide: () => void;
}

const UNITS: Array<{ value: RecurrenceUnit; label: string }> = [
  { value: 'DAY', label: 'day(s)' },
  { value: 'WEEK', label: 'week(s)' },
  { value: 'MONTH', label: 'month(s)' },
  { value: 'YEAR', label: 'year(s)' },
];

/**
 * Owns its own form state, initialised from `editing`. Mount with
 * `key={editing?.id ?? 'new'}` so React remounts it rather than syncing props
 * into state.
 *
 * Recurrence is driven by a single "repeats" checkbox rather than two
 * independently-optional fields. The database requires interval and unit to be
 * both set or both null, and a toggle makes the half-specified state
 * unreachable from the UI instead of merely validated against.
 */
export function ScenarioEventFormModal({
  show,
  editing,
  people,
  categories,
  scenarioStart,
  scenarioEnd,
  submitError,
  onSubmit,
  onHide,
}: ScenarioEventFormModalProps) {
  const [personId, setPersonId] = useState(editing?.person.id ?? '');
  const [categoryId, setCategoryId] = useState(editing?.category.id ?? '');
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [startDate, setStartDate] = useState(editing?.startDate ?? scenarioStart);
  const [endDate, setEndDate] = useState(editing?.endDate ?? '');
  const [repeats, setRepeats] = useState(editing?.recurrenceInterval != null);
  const [interval, setInterval] = useState(
    editing?.recurrenceInterval != null ? String(editing.recurrenceInterval) : '1'
  );
  const [unit, setUnit] = useState<RecurrenceUnit>(editing?.recurrenceUnit ?? 'MONTH');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!personId || !categoryId || !amount || !startDate) {
      setValidationError('Person, category, amount and start date are all required');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount === 0) {
      setValidationError('Amount must be a non-zero number');
      return;
    }

    const parsedInterval = repeats ? parseInt(interval, 10) : null;
    if (repeats && (!Number.isInteger(parsedInterval) || (parsedInterval ?? 0) < 1)) {
      setValidationError('Repeat interval must be a whole number of 1 or more');
      return;
    }

    if (endDate && endDate < startDate) {
      setValidationError('End date cannot be before the start date');
      return;
    }

    setValidationError('');
    onSubmit({
      personId,
      categoryId,
      amount: parsedAmount,
      description: description || null,
      startDate,
      // A one-time event has nothing to stop after, so the end date is dropped
      // rather than carried over from a previously-recurring version.
      endDate: repeats ? endDate || null : null,
      // Always written as a pair, matching the database constraint.
      recurrenceInterval: parsedInterval,
      recurrenceUnit: repeats ? unit : null,
    });
  };

  const error = validationError || submitError;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{editing ? 'Edit Event' : 'Add Event'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="event-person">
                <Form.Label>Person *</Form.Label>
                <Form.Select
                  value={personId}
                  onChange={(e) => setPersonId(e.target.value)}
                  autoFocus
                >
                  <option value="">Select person...</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="event-category">
                <Form.Label>Category *</Form.Label>
                <Form.Select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">Select category...</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3" controlId="event-amount">
            <Form.Label>Amount (€ — positive to add, negative to withdraw) *</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="event-start">
                <Form.Label>First occurrence *</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Form.Text className="text-muted">
                  Scenario runs {scenarioStart} to {scenarioEnd}. Occurrences outside that
                  range are ignored.
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="event-end">
                <Form.Label>Stops after (optional)</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={!repeats}
                />
                <Form.Text className="text-muted">
                  Leave blank to run to the end of the scenario.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="event-repeats"
              label="Repeats"
              checked={repeats}
              onChange={(e) => setRepeats(e.target.checked)}
            />
          </Form.Group>

          {repeats && (
            <Row className="mb-3">
              <Col xs={4}>
                <Form.Group controlId="event-interval">
                  <Form.Label>Every</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    step="1"
                    value={interval}
                    onChange={(e) => setInterval(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col xs={8}>
                <Form.Group controlId="event-unit">
                  <Form.Label>Unit</Form.Label>
                  <Form.Select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as RecurrenceUnit)}
                  >
                    {UNITS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          )}

          <Form.Group className="mb-3" controlId="event-description">
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
