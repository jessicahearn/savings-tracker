import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScenarioEventFormModal } from '../components/ScenarioEventFormModal';
import type {
  PersonFieldsFragment,
  CategoryFieldsFragment,
  ScenarioEventFieldsFragment,
} from '../graphql/generated';

const people: PersonFieldsFragment[] = [
  { id: '1', name: 'Jess', createdAt: '2026-01-01' },
  { id: '2', name: 'Gabi', createdAt: '2026-01-01' },
];

const categories: CategoryFieldsFragment[] = [
  { id: '10', name: 'Cushion', createdAt: '2026-01-01' },
  { id: '20', name: 'Travel', createdAt: '2026-01-01' },
];

const recurringEvent: ScenarioEventFieldsFragment = {
  id: '99',
  amount: -250.5,
  description: 'Car loan',
  startDate: '2027-01-15',
  endDate: '2027-06-15',
  recurrenceInterval: 2,
  recurrenceUnit: 'WEEK',
  createdAt: '2026-12-01',
  person: people[1],
  category: categories[1],
};

function renderModal(
  overrides: Partial<React.ComponentProps<typeof ScenarioEventFormModal>> = {}
) {
  const onSubmit = vi.fn();
  const onHide = vi.fn();
  render(
    <ScenarioEventFormModal
      show
      editing={null}
      people={people}
      categories={categories}
      scenarioStart="2026-12-01"
      scenarioEnd="2027-12-01"
      onSubmit={onSubmit}
      onHide={onHide}
      {...overrides}
    />
  );
  return { onSubmit, onHide };
}

/** Date inputs are more reliable to set directly than to type into. */
function setDate(labelPattern: RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(labelPattern), { target: { value } });
}

async function fillRequired(user: ReturnType<typeof userEvent.setup>, amount = '100') {
  await user.selectOptions(screen.getByLabelText(/person/i), '1');
  await user.selectOptions(screen.getByLabelText(/category/i), '10');
  await user.type(screen.getByLabelText(/amount/i), amount);
}

describe('defaults', () => {
  it('defaults the first occurrence to the scenario start', () => {
    renderModal();
    expect((screen.getByLabelText(/first occurrence/i) as HTMLInputElement).value).toBe(
      '2026-12-01'
    );
  });

  it('shows the scenario window as guidance', () => {
    renderModal();
    expect(screen.getByText(/Scenario runs 2026-12-01 to 2027-12-01/)).toBeTruthy();
  });

  it('starts as a one-time event', () => {
    renderModal();
    expect((screen.getByLabelText('Repeats') as HTMLInputElement).checked).toBe(false);
  });
});

describe('recurrence toggle', () => {
  it('hides the interval and unit until Repeats is checked', async () => {
    const user = userEvent.setup();
    renderModal();

    expect(screen.queryByLabelText(/^every$/i)).toBeNull();
    expect(screen.queryByLabelText(/unit/i)).toBeNull();

    await user.click(screen.getByLabelText('Repeats'));

    expect(screen.getByLabelText(/^every$/i)).toBeTruthy();
    expect(screen.getByLabelText(/unit/i)).toBeTruthy();
  });

  it('disables the end date for a one-time event', async () => {
    const user = userEvent.setup();
    renderModal();

    expect((screen.getByLabelText(/stops after/i) as HTMLInputElement).disabled).toBe(true);
    await user.click(screen.getByLabelText('Repeats'));
    expect((screen.getByLabelText(/stops after/i) as HTMLInputElement).disabled).toBe(false);
  });
});

describe('validation', () => {
  it('blocks submit when required fields are empty', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal();

    await user.click(screen.getByRole('button', { name: /create/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/all required/i)).toBeTruthy();
  });

  it('rejects a zero amount', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal();

    await fillRequired(user, '0');
    await user.click(screen.getByRole('button', { name: /create/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/non-zero number/i)).toBeTruthy();
  });

  it('rejects an end date before the start date', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal();

    await fillRequired(user);
    await user.click(screen.getByLabelText('Repeats'));
    setDate(/first occurrence/i, '2027-06-01');
    setDate(/stops after/i, '2027-01-01');
    await user.click(screen.getByRole('button', { name: /create/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/cannot be before the start date/i)).toBeTruthy();
  });

  it('rejects an interval below one', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal();

    await fillRequired(user);
    await user.click(screen.getByLabelText('Repeats'));
    fireEvent.change(screen.getByLabelText(/^every$/i), { target: { value: '0' } });
    await user.click(screen.getByRole('button', { name: /create/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/1 or more/i)).toBeTruthy();
  });

  it('surfaces a submit error from the parent', () => {
    renderModal({ submitError: 'Server said no' });
    expect(screen.getByText('Server said no')).toBeTruthy();
  });
});

describe('submitted values', () => {
  it('sends both recurrence fields null for a one-time event', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal();

    await fillRequired(user, '250');
    setDate(/first occurrence/i, '2027-03-15');
    await user.click(screen.getByRole('button', { name: /create/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      personId: '1',
      categoryId: '10',
      amount: 250,
      description: null,
      startDate: '2027-03-15',
      endDate: null,
      recurrenceInterval: null,
      recurrenceUnit: null,
    });
  });

  it('sends interval and unit together for a recurring event', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal();

    await fillRequired(user, '100');
    await user.click(screen.getByLabelText('Repeats'));
    await user.selectOptions(screen.getByLabelText(/unit/i), 'MONTH');
    await user.click(screen.getByRole('button', { name: /create/i }));

    // The database rejects a half-specified recurrence, so the pair must always
    // travel together — which the toggle guarantees.
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ recurrenceInterval: 1, recurrenceUnit: 'MONTH' })
    );
  });

  it('accepts a negative amount for a planned withdrawal', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal();

    await fillRequired(user, '-75.5');
    await user.click(screen.getByRole('button', { name: /create/i }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ amount: -75.5 }));
  });

  it('sends null rather than an empty string for a blank description', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal();

    await fillRequired(user);
    await user.click(screen.getByRole('button', { name: /create/i }));

    expect(onSubmit.mock.calls[0][0].description).toBeNull();
  });

  it('sends the end date only when the event repeats', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal();

    await fillRequired(user);
    await user.click(screen.getByLabelText('Repeats'));
    setDate(/stops after/i, '2027-06-01');
    await user.click(screen.getByRole('button', { name: /create/i }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ endDate: '2027-06-01' }));
  });
});

describe('editing an existing event', () => {
  it('pre-populates every field', () => {
    renderModal({ editing: recurringEvent });

    expect((screen.getByLabelText(/person/i) as HTMLSelectElement).value).toBe('2');
    expect((screen.getByLabelText(/category/i) as HTMLSelectElement).value).toBe('20');
    expect((screen.getByLabelText(/amount/i) as HTMLInputElement).value).toBe('-250.5');
    expect((screen.getByLabelText(/first occurrence/i) as HTMLInputElement).value).toBe(
      '2027-01-15'
    );
    expect((screen.getByLabelText(/stops after/i) as HTMLInputElement).value).toBe('2027-06-15');
    expect((screen.getByLabelText(/description/i) as HTMLTextAreaElement).value).toBe('Car loan');
    expect(screen.getByRole('button', { name: /update/i })).toBeTruthy();
  });

  it('shows the recurrence as already on, with its interval and unit', () => {
    renderModal({ editing: recurringEvent });

    expect((screen.getByLabelText('Repeats') as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText(/^every$/i) as HTMLInputElement).value).toBe('2');
    expect((screen.getByLabelText(/unit/i) as HTMLSelectElement).value).toBe('WEEK');
  });

  it('keeps a negative amount negative through an edit that does not touch it', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal({ editing: recurringEvent });

    await user.clear(screen.getByLabelText(/description/i));
    await user.type(screen.getByLabelText(/description/i), 'Car loan, revised');
    await user.click(screen.getByRole('button', { name: /update/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ amount: -250.5, description: 'Car loan, revised' })
    );
  });

  it('clears both recurrence fields and the end date when Repeats is unchecked', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal({ editing: recurringEvent });

    await user.click(screen.getByLabelText('Repeats'));
    await user.click(screen.getByRole('button', { name: /update/i }));

    // Converting to one-time drops the end date too — it has nothing left to
    // stop after, and carrying it over would store a confusing row.
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        recurrenceInterval: null,
        recurrenceUnit: null,
        endDate: null,
      })
    );
  });

  it('can turn a one-time event into a recurring one', async () => {
    const user = userEvent.setup();
    const oneTime: ScenarioEventFieldsFragment = {
      ...recurringEvent,
      endDate: null,
      recurrenceInterval: null,
      recurrenceUnit: null,
    };
    const { onSubmit } = renderModal({ editing: oneTime });

    expect((screen.getByLabelText('Repeats') as HTMLInputElement).checked).toBe(false);

    await user.click(screen.getByLabelText('Repeats'));
    await user.click(screen.getByRole('button', { name: /update/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ recurrenceInterval: 1, recurrenceUnit: 'MONTH' })
    );
  });
});
