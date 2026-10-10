import { describe, it, expect, afterAll } from 'vitest';
import {
  getScenariosByAccount,
  getScenarioById,
  createScenario,
  updateScenario,
  deleteScenario,
  getEventsByScenario,
  getScenarioEventById,
  createScenarioEvent,
  updateScenarioEvent,
  deleteScenarioEvent,
  type CreateScenarioEventData,
} from '../repositories/scenariosRepo.js';
import { withRollback, closeTestPool, seedBasics } from './support/testDb.js';
import type { PoolClient } from 'pg';

afterAll(closeTestPool);

async function setup(db: PoolClient) {
  const fx = await seedBasics(db, {
    people: ['Alice', 'Bob'],
    categories: ['Groceries', 'Savings'],
  });
  const scenario = await createScenario(db, {
    accountId: fx.accountId,
    name: 'Next Year',
    startDate: '2026-12-01',
    endDate: '2027-12-01',
  });
  return { fx, scenario };
}

function eventData(
  scenarioId: number,
  personId: number,
  categoryId: number,
  overrides: Partial<CreateScenarioEventData> = {}
): CreateScenarioEventData {
  return {
    scenarioId,
    personId,
    categoryId,
    amount: 100,
    description: null,
    startDate: '2026-12-01',
    endDate: null,
    recurrenceInterval: 1,
    recurrenceUnit: 'MONTH',
    ...overrides,
  };
}

describe('scenario CRUD', () => {
  it('creates and reads back a scenario', async () => {
    await withRollback(async (db) => {
      const { scenario } = await setup(db);

      expect(scenario.name).toBe('Next Year');
      // Dates come back as YYYY-MM-DD strings, not Date objects.
      expect(scenario.start_date).toBe('2026-12-01');
      expect(scenario.end_date).toBe('2027-12-01');

      const found = await getScenarioById(db, scenario.id);
      expect(found?.id).toBe(scenario.id);
    });
  });

  it('lists scenarios for an account only', async () => {
    await withRollback(async (db) => {
      const { fx, scenario } = await setup(db);
      const other = await seedBasics(db, { people: [], categories: [], accountName: 'Other' });
      await createScenario(db, {
        accountId: other.accountId,
        name: 'Elsewhere',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      });

      const mine = await getScenariosByAccount(db, fx.accountId);
      expect(mine).toHaveLength(1);
      expect(mine[0].id).toBe(scenario.id);
    });
  });

  it('updates only the fields provided', async () => {
    await withRollback(async (db) => {
      const { scenario } = await setup(db);
      const updated = await updateScenario(db, scenario.id, { name: 'Renamed' });

      expect(updated?.name).toBe('Renamed');
      expect(updated?.start_date).toBe('2026-12-01');
      expect(updated?.end_date).toBe('2027-12-01');
    });
  });

  it('rejects an end date before the start date', async () => {
    await withRollback(async (db) => {
      const { scenario } = await setup(db);
      await expect(
        updateScenario(db, scenario.id, { endDate: '2026-01-01' })
      ).rejects.toThrow(/scenarios_dates_ordered/);
    });
  });

  it('returns null when updating or reading a missing scenario', async () => {
    await withRollback(async (db) => {
      expect(await getScenarioById(db, -1)).toBeNull();
      expect(await updateScenario(db, -1, { name: 'x' })).toBeNull();
      expect(await deleteScenario(db, -1)).toBe(false);
    });
  });

  it('deletes a scenario and cascades to its events', async () => {
    await withRollback(async (db) => {
      const { fx, scenario } = await setup(db);
      const event = await createScenarioEvent(
        db,
        eventData(scenario.id, fx.people.Alice, fx.categories.Savings)
      );

      expect(await deleteScenario(db, scenario.id)).toBe(true);
      expect(await getScenarioEventById(db, event.id)).toBeNull();
    });
  });
});

describe('scenario event CRUD', () => {
  it('creates a recurring event', async () => {
    await withRollback(async (db) => {
      const { fx, scenario } = await setup(db);
      const event = await createScenarioEvent(
        db,
        eventData(scenario.id, fx.people.Alice, fx.categories.Savings, {
          amount: -250.5,
          description: 'Rent',
          endDate: '2027-06-01',
          recurrenceInterval: 2,
          recurrenceUnit: 'WEEK',
        })
      );

      expect(Number(event.amount)).toBe(-250.5);
      expect(event.description).toBe('Rent');
      expect(event.start_date).toBe('2026-12-01');
      expect(event.end_date).toBe('2027-06-01');
      expect(event.recurrence_interval).toBe(2);
      expect(event.recurrence_unit).toBe('WEEK');
    });
  });

  it('creates a one-time event with both recurrence fields null', async () => {
    await withRollback(async (db) => {
      const { fx, scenario } = await setup(db);
      const event = await createScenarioEvent(
        db,
        eventData(scenario.id, fx.people.Alice, fx.categories.Savings, {
          recurrenceInterval: null,
          recurrenceUnit: null,
        })
      );

      expect(event.recurrence_interval).toBeNull();
      expect(event.recurrence_unit).toBeNull();
    });
  });

  it('is prevented from storing a half-specified recurrence', async () => {
    await withRollback(async (db) => {
      const { fx, scenario } = await setup(db);
      await expect(
        createScenarioEvent(
          db,
          eventData(scenario.id, fx.people.Alice, fx.categories.Savings, {
            recurrenceInterval: 1,
            recurrenceUnit: null,
          })
        )
      ).rejects.toThrow(/scenario_events_recurrence_paired/);
    });
  });

  it('joins person and category when listing', async () => {
    await withRollback(async (db) => {
      const { fx, scenario } = await setup(db);
      await createScenarioEvent(
        db,
        eventData(scenario.id, fx.people.Bob, fx.categories.Groceries)
      );

      const events = await getEventsByScenario(db, scenario.id);
      expect(events).toHaveLength(1);
      expect(events[0].person_name).toBe('Bob');
      expect(events[0].category_name).toBe('Groceries');
      expect(events[0].person_created_at).toBeTruthy();
    });
  });

  it('orders events by start date', async () => {
    await withRollback(async (db) => {
      const { fx, scenario } = await setup(db);
      await createScenarioEvent(
        db,
        eventData(scenario.id, fx.people.Alice, fx.categories.Savings, {
          startDate: '2027-03-01',
        })
      );
      await createScenarioEvent(
        db,
        eventData(scenario.id, fx.people.Alice, fx.categories.Savings, {
          startDate: '2026-12-15',
        })
      );

      const events = await getEventsByScenario(db, scenario.id);
      expect(events.map((e) => e.start_date)).toEqual(['2026-12-15', '2027-03-01']);
    });
  });

  it('lists events for the given scenario only', async () => {
    await withRollback(async (db) => {
      const { fx, scenario } = await setup(db);
      const second = await createScenario(db, {
        accountId: fx.accountId,
        name: 'Other Plan',
        startDate: '2028-01-01',
        endDate: '2028-12-31',
      });
      await createScenarioEvent(
        db,
        eventData(scenario.id, fx.people.Alice, fx.categories.Savings)
      );
      await createScenarioEvent(
        db,
        eventData(second.id, fx.people.Alice, fx.categories.Savings, {
          startDate: '2028-01-01',
        })
      );

      expect(await getEventsByScenario(db, scenario.id)).toHaveLength(1);
      expect(await getEventsByScenario(db, second.id)).toHaveLength(1);
    });
  });

  it('leaves unmentioned fields alone on update', async () => {
    await withRollback(async (db) => {
      const { fx, scenario } = await setup(db);
      const event = await createScenarioEvent(
        db,
        eventData(scenario.id, fx.people.Alice, fx.categories.Savings, {
          amount: -75.25,
          description: 'Original',
        })
      );

      const updated = await updateScenarioEvent(db, event.id, { description: 'Edited' });

      expect(updated?.description).toBe('Edited');
      // The sign survives an edit that does not mention the amount.
      expect(Number(updated?.amount)).toBe(-75.25);
      expect(updated?.recurrence_interval).toBe(1);
      expect(updated?.recurrence_unit).toBe('MONTH');
    });
  });

  it('clears an end date with an explicit null', async () => {
    await withRollback(async (db) => {
      const { fx, scenario } = await setup(db);
      const event = await createScenarioEvent(
        db,
        eventData(scenario.id, fx.people.Alice, fx.categories.Savings, {
          endDate: '2027-06-01',
        })
      );

      const updated = await updateScenarioEvent(db, event.id, { endDate: null });
      // `pick` distinguishes an explicit null from an omitted field; using ??
      // here would silently keep the old date.
      expect(updated?.end_date).toBeNull();
    });
  });

  it('converts a recurring event to a one-time one', async () => {
    await withRollback(async (db) => {
      const { fx, scenario } = await setup(db);
      const event = await createScenarioEvent(
        db,
        eventData(scenario.id, fx.people.Alice, fx.categories.Savings)
      );

      const updated = await updateScenarioEvent(db, event.id, {
        recurrenceInterval: null,
        recurrenceUnit: null,
      });

      expect(updated?.recurrence_interval).toBeNull();
      expect(updated?.recurrence_unit).toBeNull();
    });
  });

  it('cannot half-clear a recurrence through an update', async () => {
    await withRollback(async (db) => {
      const { fx, scenario } = await setup(db);
      const event = await createScenarioEvent(
        db,
        eventData(scenario.id, fx.people.Alice, fx.categories.Savings)
      );

      await expect(
        updateScenarioEvent(db, event.id, { recurrenceUnit: null })
      ).rejects.toThrow(/scenario_events_recurrence_paired/);
    });
  });

  it('deletes an event and reports whether a row went', async () => {
    await withRollback(async (db) => {
      const { fx, scenario } = await setup(db);
      const event = await createScenarioEvent(
        db,
        eventData(scenario.id, fx.people.Alice, fx.categories.Savings)
      );

      expect(await deleteScenarioEvent(db, event.id)).toBe(true);
      expect(await getScenarioEventById(db, event.id)).toBeNull();
      expect(await deleteScenarioEvent(db, event.id)).toBe(false);
    });
  });

  it('returns null when updating a missing event', async () => {
    await withRollback(async (db) => {
      expect(await updateScenarioEvent(db, -1, { amount: 5 })).toBeNull();
    });
  });
});
