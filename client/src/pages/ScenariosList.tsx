import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, Modal, Form, Alert, Row, Col } from 'react-bootstrap';
import {
  useGetScenariosQuery,
  useCreateScenarioMutation,
  useUpdateScenarioMutation,
  useDeleteScenarioMutation,
  type ScenarioFieldsFragment,
} from '../graphql/generated';

/** Today as YYYY-MM-DD, for defaulting a new scenario's start. */
function today(): string {
  return new Date().toISOString().split('T')[0];
}

/** One year on from `date`, keeping the day-of-month. */
function oneYearLater(date: string): string {
  const [y, m, d] = date.split('-');
  return `${Number(y) + 1}-${m}-${d}`;
}

export function ScenariosList() {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();

  const { data, loading, refetch } = useGetScenariosQuery({
    variables: { accountId: accountId! },
  });

  const [createScenario] = useCreateScenarioMutation();
  const [updateScenario] = useUpdateScenarioMutation();
  const [deleteScenario] = useDeleteScenarioMutation();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ScenarioFieldsFragment | null>(null);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  const openCreate = () => {
    const start = today();
    setEditing(null);
    setName('');
    setStartDate(start);
    setEndDate(oneYearLater(start));
    setError('');
    setShowModal(true);
  };

  const openEdit = (scenario: ScenarioFieldsFragment) => {
    setEditing(scenario);
    setName(scenario.name);
    setStartDate(scenario.startDate);
    setEndDate(scenario.endDate);
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!startDate || !endDate) {
      setError('Both dates are required');
      return;
    }
    if (endDate < startDate) {
      setError('End date cannot be before the start date');
      return;
    }

    try {
      if (editing) {
        await updateScenario({
          variables: { id: editing.id, input: { name, startDate, endDate } },
        });
      } else {
        await createScenario({
          variables: { input: { accountId: accountId!, name, startDate, endDate } },
        });
      }
      closeModal();
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const handleDelete = async (scenario: ScenarioFieldsFragment) => {
    if (!window.confirm(`Delete "${scenario.name}" and all of its events?`)) return;

    try {
      await deleteScenario({ variables: { id: scenario.id } });
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  if (loading) return <div>Loading...</div>;

  const scenarios = data?.scenarios ?? [];

  return (
    <div>
      <Button
        variant="outline-primary"
        onClick={() => navigate(`/accounts/${accountId}`)}
        className="mb-3"
      >
        ← Back to Account
      </Button>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Scenarios</h2>
        <Button variant="primary" onClick={openCreate}>
          New Scenario
        </Button>
      </div>

      {error && !showModal && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {scenarios.length === 0 ? (
        <p className="text-muted">
          No scenarios yet. Create one to project this account forward.
        </p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>From</th>
              <th>To</th>
              <th style={{ width: '250px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((scenario) => (
              <tr key={scenario.id}>
                <td>{scenario.name}</td>
                <td>{scenario.startDate}</td>
                <td>{scenario.endDate}</td>
                <td>
                  <Button
                    variant="primary"
                    size="sm"
                    className="me-2"
                    onClick={() => navigate(`/scenarios/${scenario.id}`)}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => openEdit(scenario)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleDelete(scenario)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? 'Edit Scenario' : 'New Scenario'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="scenario-name">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Next 12 months"
                autoFocus
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="scenario-start">
                  <Form.Label>Start date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <Form.Text className="text-muted">
                    Balances are taken as at this date.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="scenario-end">
                  <Form.Label>End date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editing ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
