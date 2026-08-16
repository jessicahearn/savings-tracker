import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionFilterBar } from '../components/TransactionFilterBar';
import type { PersonFieldsFragment, CategoryFieldsFragment } from '../graphql/generated';

const people: PersonFieldsFragment[] = [
  { id: '1', name: 'Jess', createdAt: '2026-01-01' },
  { id: '2', name: 'Sam', createdAt: '2026-01-01' },
];

const categories: CategoryFieldsFragment[] = [
  { id: '10', name: 'Groceries', createdAt: '2026-01-01' },
  { id: '20', name: 'Travel', createdAt: '2026-01-01' },
];

function renderBar(personIds: string[] = [], categoryIds: string[] = []) {
  const onPersonIdsChange = vi.fn();
  const onCategoryIdsChange = vi.fn();
  render(
    <TransactionFilterBar
      people={people}
      categories={categories}
      personIds={personIds}
      categoryIds={categoryIds}
      onPersonIdsChange={onPersonIdsChange}
      onCategoryIdsChange={onCategoryIdsChange}
    />
  );
  return { onPersonIdsChange, onCategoryIdsChange };
}

describe('TransactionFilterBar', () => {
  it('renders an option per person and per category', () => {
    renderBar();
    expect(screen.getByRole('option', { name: 'Jess' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Sam' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Groceries' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Travel' })).toBeTruthy();
  });

  it('emits the selected person id', async () => {
    const user = userEvent.setup();
    const { onPersonIdsChange, onCategoryIdsChange } = renderBar();

    await user.selectOptions(screen.getByLabelText(/by person/i), ['2']);

    expect(onPersonIdsChange).toHaveBeenCalledWith(['2']);
    expect(onCategoryIdsChange).not.toHaveBeenCalled();
  });

  it('emits multiple selected person ids', async () => {
    const user = userEvent.setup();
    // Controlled component: the already-selected id comes in as a prop, so the
    // second selection must be additive rather than replacing the first.
    const { onPersonIdsChange } = renderBar(['1']);

    await user.selectOptions(screen.getByLabelText(/by person/i), ['2']);

    expect(onPersonIdsChange).toHaveBeenLastCalledWith(['1', '2']);
  });

  it('emits the selected category id independently of people', async () => {
    const user = userEvent.setup();
    const { onPersonIdsChange, onCategoryIdsChange } = renderBar();

    await user.selectOptions(screen.getByLabelText(/by category/i), ['20']);

    expect(onCategoryIdsChange).toHaveBeenCalledWith(['20']);
    expect(onPersonIdsChange).not.toHaveBeenCalled();
  });

  it('emits an empty array when the last selection is cleared', async () => {
    const user = userEvent.setup();
    const { onPersonIdsChange } = renderBar(['1']);

    await user.deselectOptions(screen.getByLabelText(/by person/i), ['1']);

    expect(onPersonIdsChange).toHaveBeenCalledWith([]);
  });
});
