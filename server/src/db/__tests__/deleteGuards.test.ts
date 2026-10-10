import { describe, it, expect, afterAll } from 'vitest';
import {
  getTransactionCountForPerson,
  getAccountCountForPerson,
  getScenarioEventCountForPerson,
  deletePerson,
} from '../repositories/peopleRepo.js';
import {
  getTransactionCountForCategory,
  getScenarioEventCountForCategory,
  deleteCategory,
} from '../repositories/categoriesRepo.js';
import { withRollback, closeTestPool, seedBasics, seedTransaction } from './support/testDb.js';
import type { PoolClient } from 'pg';

afterAll(closeTestPool);

/**
 * These exist because the same bug has now appeared twice: a new table gains an
 * ON DELETE RESTRICT reference to people or categories, the delete guard is not
 * updated, and the friendly "still linked to…" message silently becomes a raw
 * Postgres foreign-key violation.
 *
 * Each test asserts both halves — that the count function sees the reference,
 * and that the database really would refuse the delete.
 */

async function seedScenarioEvent(
  db: PoolClient,
  args: { accountId: number; personId: number; categoryId: number }
): Promise<number> {
  const scenario = await db.query(
    `INSERT INTO scenarios (account_id, name, start_date, end_date)
     VALUES ($1, 'Test Scenario', '2026-12-01', '2027-12-01') RETURNING id`,
    [args.accountId]
  );
  const event = await db.query(
    `INSERT INTO scenario_events
       (scenario_id, person_id, category_id, amount, start_date, recurrence_interval, recurrence_unit)
     VALUES ($1, $2, $3, 100, '2026-12-01', 1, 'MONTH') RETURNING id`,
    [scenario.rows[0].id, args.personId, args.categoryId]
  );
  return event.rows[0].id;
}

describe('person delete guards', () => {
  it('counts zero for a person nothing references', async () => {
    await withRollback(async (db) => {
      const row = await db.query(`INSERT INTO people (name) VALUES ('Nobody') RETURNING id`);
      const personId = row.rows[0].id;

      expect(await getTransactionCountForPerson(db, personId)).toBe(0);
      expect(await getAccountCountForPerson(db, personId)).toBe(0);
      expect(await getScenarioEventCountForPerson(db, personId)).toBe(0);
      expect(await deletePerson(db, personId)).toBe(true);
    });
  });

  it('counts account membership', async () => {
    await withRollback(async (db) => {
      const fx = await seedBasics(db, { people: ['Alice'], categories: [] });
      expect(await getAccountCountForPerson(db, fx.people.Alice)).toBe(1);
    });
  });

  it('counts transactions', async () => {
    await withRollback(async (db) => {
      const fx = await seedBasics(db, { people: ['Alice'], categories: ['Savings'] });
      await seedTransaction(db, {
        accountId: fx.accountId,
        personId: fx.people.Alice,
        categoryId: fx.categories.Savings,
        amount: 10,
        occurredOn: '2026-01-01',
      });

      expect(await getTransactionCountForPerson(db, fx.people.Alice)).toBe(1);
    });
  });

  it('counts scenario events — the reference added in this step', async () => {
    await withRollback(async (db) => {
      const fx = await seedBasics(db, { people: ['Alice'], categories: ['Savings'] });
      await seedScenarioEvent(db, {
        accountId: fx.accountId,
        personId: fx.people.Alice,
        categoryId: fx.categories.Savings,
      });

      expect(await getScenarioEventCountForPerson(db, fx.people.Alice)).toBe(1);
    });
  });

  it('is really blocked by a scenario event, with no other reference present', async () => {
    await withRollback(async (db) => {
      // A person on no account and with no transactions, referenced only by a
      // scenario event. Before this step every count returned zero and the
      // DELETE blew up with a raw FK violation.
      const fx = await seedBasics(db, { people: [], categories: ['Savings'] });
      const person = await db.query(`INSERT INTO people (name) VALUES ('Ghost') RETURNING id`);
      const personId = person.rows[0].id;

      await seedScenarioEvent(db, {
        accountId: fx.accountId,
        personId,
        categoryId: fx.categories.Savings,
      });

      expect(await getTransactionCountForPerson(db, personId)).toBe(0);
      expect(await getAccountCountForPerson(db, personId)).toBe(0);
      expect(await getScenarioEventCountForPerson(db, personId)).toBe(1);

      await expect(deletePerson(db, personId)).rejects.toThrow(
        /scenario_events_person_id_fkey/
      );
    });
  });

  it('counts every reference independently', async () => {
    await withRollback(async (db) => {
      const fx = await seedBasics(db, { people: ['Alice'], categories: ['Savings'] });
      await seedTransaction(db, {
        accountId: fx.accountId,
        personId: fx.people.Alice,
        categoryId: fx.categories.Savings,
        amount: 10,
        occurredOn: '2026-01-01',
      });
      await seedTransaction(db, {
        accountId: fx.accountId,
        personId: fx.people.Alice,
        categoryId: fx.categories.Savings,
        amount: 20,
        occurredOn: '2026-02-01',
      });
      await seedScenarioEvent(db, {
        accountId: fx.accountId,
        personId: fx.people.Alice,
        categoryId: fx.categories.Savings,
      });

      expect(await getTransactionCountForPerson(db, fx.people.Alice)).toBe(2);
      expect(await getAccountCountForPerson(db, fx.people.Alice)).toBe(1);
      expect(await getScenarioEventCountForPerson(db, fx.people.Alice)).toBe(1);
    });
  });
});

describe('category delete guards', () => {
  it('counts zero for an unused category', async () => {
    await withRollback(async (db) => {
      const row = await db.query(
        `INSERT INTO transaction_categories (name) VALUES ('Unused') RETURNING id`
      );
      const categoryId = row.rows[0].id;

      expect(await getTransactionCountForCategory(db, categoryId)).toBe(0);
      expect(await getScenarioEventCountForCategory(db, categoryId)).toBe(0);
      expect(await deleteCategory(db, categoryId)).toBe(true);
    });
  });

  it('counts transactions', async () => {
    await withRollback(async (db) => {
      const fx = await seedBasics(db, { people: ['Alice'], categories: ['Savings'] });
      await seedTransaction(db, {
        accountId: fx.accountId,
        personId: fx.people.Alice,
        categoryId: fx.categories.Savings,
        amount: 10,
        occurredOn: '2026-01-01',
      });

      expect(await getTransactionCountForCategory(db, fx.categories.Savings)).toBe(1);
    });
  });

  it('is really blocked by a scenario event, with no transactions present', async () => {
    await withRollback(async (db) => {
      const fx = await seedBasics(db, { people: ['Alice'], categories: ['Planned'] });
      await seedScenarioEvent(db, {
        accountId: fx.accountId,
        personId: fx.people.Alice,
        categoryId: fx.categories.Planned,
      });

      expect(await getTransactionCountForCategory(db, fx.categories.Planned)).toBe(0);
      expect(await getScenarioEventCountForCategory(db, fx.categories.Planned)).toBe(1);

      await expect(deleteCategory(db, fx.categories.Planned)).rejects.toThrow(
        /scenario_events_category_id_fkey/
      );
    });
  });
});

describe('scenario cascade', () => {
  it('removes a scenario\'s events when the scenario goes', async () => {
    await withRollback(async (db) => {
      const fx = await seedBasics(db, { people: ['Alice'], categories: ['Savings'] });
      const eventId = await seedScenarioEvent(db, {
        accountId: fx.accountId,
        personId: fx.people.Alice,
        categoryId: fx.categories.Savings,
      });

      await db.query(`DELETE FROM scenarios WHERE account_id = $1`, [fx.accountId]);

      const remaining = await db.query(`SELECT 1 FROM scenario_events WHERE id = $1`, [eventId]);
      expect(remaining.rowCount).toBe(0);
    });
  });

  it('removes scenarios when their account goes', async () => {
    await withRollback(async (db) => {
      const fx = await seedBasics(db, { people: [], categories: [] });
      await db.query(
        `INSERT INTO scenarios (account_id, name, start_date, end_date)
         VALUES ($1, 'Doomed', '2026-01-01', '2026-12-31')`,
        [fx.accountId]
      );

      await db.query(`DELETE FROM accounts WHERE id = $1`, [fx.accountId]);

      const remaining = await db.query(`SELECT 1 FROM scenarios WHERE account_id = $1`, [
        fx.accountId,
      ]);
      expect(remaining.rowCount).toBe(0);
    });
  });
});
