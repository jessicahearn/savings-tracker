import { useState } from 'react';
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap';

export interface ManagedEntity {
  id: string;
  name: string;
}

interface EntityManagerProps {
  /** Plural heading for the page, e.g. "People". */
  title: string;
  /** Singular noun used in buttons and the modal title, e.g. "Person". */
  entityName: string;
  entities: ManagedEntity[];
  loading: boolean;
  onCreate: (name: string) => Promise<unknown>;
  onUpdate: (id: string, name: string) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

/**
 * Shared list/create/edit/delete screen for the simple name-only entities
 * (people, transaction categories). Both pages were byte-identical apart from
 * one field name, so they share this and supply their own mutations.
 */
export function EntityManager({
  title,
  entityName,
  entities,
  loading,
  onCreate,
  onUpdate,
  onDelete,
}: EntityManagerProps) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ManagedEntity | null>(null);
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const handleOpenCreate = () => {
    setEditing(null);
    setName('');
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (entity: ManagedEntity) => {
    setEditing(entity);
    setName(entity.name);
    setFormError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditing(null);
    setName('');
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Name is required');
      return;
    }

    try {
      if (editing) {
        await onUpdate(editing.id, name.trim());
      } else {
        await onCreate(name.trim());
      }
      handleCloseModal();
    } catch (err) {
      setFormError(errorMessage(err, 'Operation failed'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Delete this ${entityName.toLowerCase()}?`)) return;

    setDeletingId(id);
    setDeleteError('');
    try {
      await onDelete(id);
    } catch (err) {
      // Deletes are blocked while the entity is still referenced. Show that
      // reason inline rather than in a browser alert — it is the message the
      // user has to act on.
      setDeleteError(errorMessage(err, 'Delete failed'));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{title}</h2>
        <Button variant="primary" onClick={handleOpenCreate}>
          Add {entityName}
        </Button>
      </div>

      {deleteError && (
        <Alert variant="danger" dismissible onClose={() => setDeleteError('')}>
          {deleteError}
        </Alert>
      )}

      {entities.length === 0 ? (
        <p className="text-muted">
          No {title.toLowerCase()} yet. Create one to get started.
        </p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th style={{ width: '200px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entities.map((entity) => (
              <tr key={entity.id}>
                <td>{entity.name}</td>
                <td>
                  <Button
                    variant="primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleOpenEdit(entity)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleDelete(entity.id)}
                    disabled={deletingId === entity.id}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editing ? `Edit ${entityName}` : `Add ${entityName}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && <Alert variant="danger">{formError}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="entity-name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
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
