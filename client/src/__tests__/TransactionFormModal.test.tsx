import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionFormModal } from '../components/TransactionFormModal';
import type {
  PersonFieldsFragment,
  CategoryFieldsFragment,
  TransactionFieldsFragment,
} from '../graphql/generated';

const people: PersonFieldsFragment[] = [
  { id: '1', name: 'Jess', createdAt: '2026-01-01' },
  { id: '2', name: 'Sam', createdAt: '2026-01-01' },
];

const categories: CategoryFieldsFragment[] = [
  { id: '10', name: 'Groceries', createdAt: '2026-01-01' },
  { id: '20', name: 'Travel', createdAt: '2026-01-01' },
];

const withdrawal: TransactionFieldsFragment = {
  id: '99',
  amount: -50.25,
  description: 'Emergency repair',
  occurredOn: '2026-03-04',
  createdAt: '2026-03-04',
  person: people[1],
  category: categories[1],
};

function renderModal(overrides: Partial<React.ComponentProps<typeof TransactionFormModal>> = {}) {
  const onSubmit = vi.fn();
  const onHide = vi.fn();
  render(
    <TransactionFormModal
      show
      editing={null}
      people={people}
      categories={categories}
      onSubmit={onSubmit}
      onHide={onHide}
      {...overrides}
    />
  );
  return { onSubmit, onHide };
}

describe('TransactionFormModal', () => {
  it('blocks submit and shows an error when required fields are empty', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal();

    await user.click(screen.getByRole('button', { name: /create/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/please fill in all required fields/i)).toBeTruthy();
  });

  it('rejects a zero amount', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal();

    await user.selectOptions(screen.getByLabelText(/person/i), '1');
    await user.selectOptions(screen.getByLabelText(/category/i), '10');
    await user.type(screen.getByLabelText(/amount/i), '0');
    await user.click(screen.getByRole('button', { name: /create/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/non-zero number/i)).toBeTruthy();
  });

  it('submits a deposit with the expected value shape', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal();

    await user.selectOptions(screen.getByLabelText(/person/i), '1');
    await user.selectOptions(screen.getByLabelText(/category/i), '10');
    await user.type(screen.getByLabelText(/amount/i), '125.50');
    await user.type(screen.getByLabelText(/description/i), 'Payday');
    await user.click(screen.getByRole('button', { name: /create/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      personId: '1',
      categoryId: '10',
      amount: 125.5,
      description: 'Payday',
      occurredOn: expect.any(String),
    });
  });

  it('sends null rather than an empty string for a blank description', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal();

    await user.selectOptions(screen.getByLabelText(/person/i), '1');
    await user.selectOptions(screen.getByLabelText(/category/i), '10');
    await user.type(screen.getByLabelText(/amount/i), '10');
    await user.click(screen.getByRole('button', { name: /create/i }));

    expect(onSubmit.mock.calls[0][0].description).toBeNull();
  });

  it('pre-populates every field when editing an existing transaction', () => {
    renderModal({ editing: withdrawal });

    expect((screen.getByLabelText(/person/i) as HTMLSelectElement).value).toBe('2');
    expect((screen.getByLabelText(/category/i) as HTMLSelectElement).value).toBe('20');
    expect((screen.getByLabelText(/amount/i) as HTMLInputElement).value).toBe('-50.25');
    expect((screen.getByLabelText(/date/i) as HTMLInputElement).value).toBe('2026-03-04');
    expect((screen.getByLabelText(/description/i) as HTMLTextAreaElement).value).toBe(
      'Emergency repair'
    );
    expect(screen.getByRole('button', { name: /update/i })).toBeTruthy();
  });

  it('keeps a withdrawal negative through an edit round-trip', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal({ editing: withdrawal });

    // Change only the description; the amount must survive untouched.
    await user.clear(screen.getByLabelText(/description/i));
    await user.type(screen.getByLabelText(/description/i), 'Roof repair');
    await user.click(screen.getByRole('button', { name: /update/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ amount: -50.25, description: 'Roof repair' })
    );
  });

  it('surfaces a submit error passed down from the parent', () => {
    renderModal({ submitError: 'Server said no' });
    expect(screen.getByText('Server said no')).toBeTruthy();
  });
});
