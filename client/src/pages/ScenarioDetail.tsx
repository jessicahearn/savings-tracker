import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Table, Card, Badge } from 'react-bootstrap';
import { TransactionFilterBar } from '../components/TransactionFilterBar';
import { ScenarioGridTable } from '../components/ScenarioGridTable';
import {
  ScenarioEventFormModal,
  type ScenarioEventFormValues,
} from '../components/ScenarioEventFormModal';
import { formatEuroSigned } from '../format';
import {
  useGetScenarioDetailQuery,
  useGetPeopleQuery,
  useGetCategoriesQuery,
  useCreateScenarioEventMutation,
  useUpdateScenarioEventMutation,
  useDeleteScenarioEventMutation,
  type ScenarioEventFieldsFragment,
  type TransactionFilter,
} from '../graphql/generated';

/** "every 2 weeks" / "one-time" */
function describeRecurrence(event: ScenarioEventFieldsFragment): string {
  if (event.recurrenceInterval == null || event.recurrenceUnit == null) return 'one-time';
  const unit = event.recurrenceUnit.toLowerCase();
  return event.recurrenceInterval === 1
    ? `every ${unit}`
    : `every ${event.recurrenceInterval} ${unit}s`;
}

export function ScenarioDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [filterPersonIds, setFilterPersonIds] = useState<string[]>([]);
  const [filterCategoryIds, setFilterCategoryIds] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ScenarioEventFieldsFragment | null>(null);
  const [submitError, setSubmitError] = useState('');

  const filter: TransactionFilter = {};
  if (filterPersonIds.length > 0) filter.personIds = filterPersonIds;
  if (filterCategoryIds.length > 0) filter.categoryIds = filterCategoryIds;

  const { data, loading, refetch } = useGetScenarioDetailQuery({
    variables: {
      id: id!,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
    },
  });

  // The filter bar offers every person and category, not just those currently
  // in the grid — otherwise narrowing the filter would remove the options
  // needed to widen it again.
  const { data: peopleData } = useGetPeopleQuery();
  const { data: categoriesData } = useGetCategoriesQuery();

  const [createEvent] = useCreateScenarioEventMutation();
  const [updateEvent] = useUpdateScenarioEventMutation();
  const [deleteEvent] = useDeleteScenarioEventMutation();

  const openCreate = () => {
    setEditing(null);
    setSubmitError('');
    setShowModal(true);
  };

  const openEdit = (event: ScenarioEventFieldsFragment) => {
    setEditing(event);
    setSubmitError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setSubmitError('');
  };

  const handleSubmit = async (values: ScenarioEventFormValues) => {
    setSubmitError('');

    try {
      if (editing) {
        await updateEvent({ variables: { id: editing.id, input: values } });
      } else {
        await createEvent({ variables: { input: { scenarioId: id!, ...values } } });
      }
      closeModal();
      await refetch();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const handleDelete = async (event: ScenarioEventFieldsFragment) => {
    if (!window.confirm('Delete this event?')) return;

    try {
      await deleteEvent({ variables: { id: event.id } });
      await refetch();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  if (loading) return <div>Loading...</div>;

  const scenario = data?.scenario;
  if (!scenario) return <div>Scenario not found</div>;

  const { grid, events, account } = scenario;
  const people = peopleData?.people ?? [];
  const categories = categoriesData?.transactionCategories ?? [];

  return (
    <div>
      <Button
        variant="outline-primary"
        onClick={() => navigate(`/accounts/${account.id}/scenarios`)}
        className="mb-3"
      >
        ← Back to Scenarios
      </Button>

      <h2>{scenario.name}</h2>
      <p className="text-muted">
        {account.name} · {scenario.startDate} to {scenario.endDate}
      </p>

      <TransactionFilterBar
        people={people}
        categories={categories}
        personIds={filterPersonIds}
        categoryIds={filterCategoryIds}
        onPersonIdsChange={setFilterPersonIds}
        onCategoryIdsChange={setFilterCategoryIds}
      />

      <ScenarioGridTable
        title="Starting position"
        subtitle={`Balances as at ${scenario.startDate}`}
        categories={grid.categories}
        data={grid.baseline}
      />

      <ScenarioGridTable
        title="Projected position"
        subtitle={`If every event below occurs, by ${scenario.endDate}`}
        categories={grid.categories}
        data={grid.projected}
      />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Events</h3>
        <Button variant="primary" onClick={openCreate}>
          Add Event
        </Button>
      </div>

      {events.length === 0 ? (
        <Card>
          <Card.Body className="text-muted">
            No events yet, so the projection matches the starting position. Add one to see
            its effect.
          </Card.Body>
        </Card>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Person</th>
              <th>Category</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th>Schedule</th>
              <th>From</th>
              <th>Until</th>
              <th>Description</th>
              <th style={{ width: '180px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{event.person.name}</td>
                <td>{event.category.name}</td>
                <td style={{ textAlign: 'right' }} className="transaction-amount">
                  <span className={event.amount >= 0 ? 'text-success' : 'text-danger'}>
                    {formatEuroSigned(event.amount)}
                  </span>
                </td>
                <td>
                  <Badge bg={event.recurrenceInterval == null ? 'secondary' : 'info'}>
                    {describeRecurrence(event)}
                  </Badge>
                </td>
                <td>{event.startDate}</td>
                <td>{event.endDate ?? '—'}</td>
                <td>{event.description || '—'}</td>
                <td>
                  <Button
                    variant="primary"
                    size="sm"
                    className="me-2"
                    onClick={() => openEdit(event)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleDelete(event)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {showModal && (
        <ScenarioEventFormModal
          key={editing?.id ?? 'new'}
          show={showModal}
          editing={editing}
          people={people}
          categories={categories}
          scenarioStart={scenario.startDate}
          scenarioEnd={scenario.endDate}
          submitError={submitError}
          onSubmit={handleSubmit}
          onHide={closeModal}
        />
      )}
    </div>
  );
}
