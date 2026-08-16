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
  it('renders a checkbox per person and per category', () => {
    renderBar();
    expect(screen.getByRole('checkbox', { name: 'Jess' })).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: 'Sam' })).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: 'Groceries' })).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: 'Travel' })).toBeTruthy();
  });

  it('reflects the selected ids as checked state', () => {
    renderBar(['2'], ['10']);
    expect((screen.getByLabelText('Jess') as HTMLInputElement).checked).toBe(false);
    expect((screen.getByLabelText('Sam') as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText('Groceries') as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText('Travel') as HTMLInputElement).checked).toBe(false);
  });

  it('gives each checkbox a unique id so labels target the right input', () => {
    renderBar();
    const ids = screen
      .getAllByRole('checkbox')
      .map((el) => (el as HTMLInputElement).id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('emits the checked person id', async () => {
    const user = userEvent.setup();
    const { onPersonIdsChange, onCategoryIdsChange } = renderBar();

    await user.click(screen.getByLabelText('Sam'));

    expect(onPersonIdsChange).toHaveBeenCalledWith(['2']);
    expect(onCategoryIdsChange).not.toHaveBeenCalled();
  });

  it('adds to the existing selection rather than replacing it', async () => {
    const user = userEvent.setup();
    const { onPersonIdsChange } = renderBar(['1']);

    await user.click(screen.getByLabelText('Sam'));

    expect(onPersonIdsChange).toHaveBeenCalledWith(['1', '2']);
  });

  it('normalises to list order regardless of click order', async () => {
    const user = userEvent.setup();
    // Sam (id 2) is already selected; checking Jess (id 1) must yield list
    // order ['1','2'], not click order ['2','1'] — otherwise Apollo caches the
    // same logical filter under two different keys.
    const { onPersonIdsChange } = renderBar(['2']);

    await user.click(screen.getByLabelText('Jess'));

    expect(onPersonIdsChange).toHaveBeenCalledWith(['1', '2']);
  });

  it('emits the checked category id independently of people', async () => {
    const user = userEvent.setup();
    const { onPersonIdsChange, onCategoryIdsChange } = renderBar();

    await user.click(screen.getByLabelText('Travel'));

    expect(onCategoryIdsChange).toHaveBeenCalledWith(['20']);
    expect(onPersonIdsChange).not.toHaveBeenCalled();
  });

  it('emits an empty array when the last selection is unchecked', async () => {
    const user = userEvent.setup();
    const { onPersonIdsChange } = renderBar(['1']);

    await user.click(screen.getByLabelText('Jess'));

    expect(onPersonIdsChange).toHaveBeenCalledWith([]);
  });

  it('shows an empty state instead of checkboxes when a list is empty', () => {
    render(
      <TransactionFilterBar
        people={[]}
        categories={categories}
        personIds={[]}
        categoryIds={[]}
        onPersonIdsChange={vi.fn()}
        onCategoryIdsChange={vi.fn()}
      />
    );
    expect(screen.getByText('No people yet.')).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: 'Groceries' })).toBeTruthy();
  });

  it('groups each set of checkboxes under a named fieldset', () => {
    renderBar();
    expect(screen.getByRole('group', { name: 'By Person' })).toBeTruthy();
    expect(screen.getByRole('group', { name: 'By Category' })).toBeTruthy();
  });
});
