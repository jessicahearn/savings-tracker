import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import {
  useGetAccountsQuery,
  useGetPeopleQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
  type AccountFieldsFragment,
  type PersonFieldsFragment,
} from '../graphql/generated';

export function AccountsList() {
  const { data, loading, refetch } = useGetAccountsQuery();
  const { data: peopleData } = useGetPeopleQuery();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [createAccount] = useCreateAccountMutation();
  const [updateAccount] = useUpdateAccountMutation();
  const [deleteAccount] = useDeleteAccountMutation();

  const handleOpenModal = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setSelectedPeople([]);
    setError('');
    setShowModal(true);
  };

  const handleEditClick = (account: AccountFieldsFragment) => {
    setEditingId(account.id);
    setName(account.name);
    setDescription(account.description || '');
    setSelectedPeople(account.people.map((p) => p.id));
    setError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setName('');
    setDescription('');
    setSelectedPeople([]);
    setError('');
  };

  const handlePeopleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedPeople(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Account name is required');
      return;
    }

    try {
      const personIds = selectedPeople;
      if (editingId) {
        await updateAccount({
          variables: {
            id: editingId,
            input: {
              name,
              description: description || null,
              personIds,
            },
          },
        });
      } else {
        await createAccount({
          variables: {
            input: {
              name,
              description: description || null,
              personIds,
            },
          },
        });
      }
      handleCloseModal();
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure? This will delete all transactions in this account.')) {
      return;
    }

    try {
      await deleteAccount({
        variables: { id },
      });
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  if (loading) return <div>Loading...</div>;

  const accounts = data?.accounts || [];
  const people = peopleData?.people || [];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Savings Accounts</h2>
        <Button variant="primary" onClick={handleOpenModal}>
          New Account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <p className="text-muted">No accounts yet. Create one to get started.</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>People</th>
              <th style={{ width: '250px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account: AccountFieldsFragment) => (
              <tr key={account.id}>
                <td>{account.name}</td>
                <td>{account.description || '—'}</td>
                <td>{account.people.map((p) => p.name).join(', ') || '—'}</td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    className="me-2"
                    onClick={() => navigate(`/accounts/${account.id}`)}
                  >
                    View
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEditClick(account)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(account.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Edit Account' : 'Create Account'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>People (hold Ctrl/Cmd to select multiple)</Form.Label>
              <Form.Select
                multiple
                value={selectedPeople}
                onChange={handlePeopleChange}
              >
                {people.map((person: PersonFieldsFragment) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editingId ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
