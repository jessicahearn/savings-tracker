import { describe, it, expect, afterAll } from 'vitest';
import {
  getTransactionsByAccount,
  getAccountTotals,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../repositories/transactionsRepo.js';
import {
  withRollback,
  closeTestPool,
  seedBasics,
  seedTransaction,
  type Fixtures,
} from './support/testDb.js';
import type { PoolClient } from 'pg';

afterAll(closeTestPool);

/**
 * Alice and Bob across Groceries and Savings, with five transactions whose
 * amounts and dates are known, so every assertion below can check a real value:
 *
 *   Alice / Groceries   +50.00   2026-03-04
 *   Alice / Savings    +500.00   2026-08-13
 *   Alice / Savings     -45.00   2026-08-13
 *   Bob   / Savings    +100.00   2026-08-01
 *   Bob   / Groceries   -20.00   2026-09-01
 *
 *   credits 650.00   debits 65.00   net 585.00
 */
async function seedScenario(db: PoolClient): Promise<Fixtures> {
  const fx = await seedBasics(db, {
    people: ['Alice', 'Bob'],
    categories: ['Groceries', 'Savings'],
  });

  const { accountId, people, categories } = fx;
  await seedTransaction(db, { accountId, personId: people.Alice, categoryId: categories.Groceries, amount: 50, occurredOn: '2026-03-04' });
  await seedTransaction(db, { accountId, personId: people.Alice, categoryId: categories.Savings, amount: 500, occurredOn: '2026-08-13' });
  await seedTransaction(db, { accountId, personId: people.Alice, categoryId: categories.Savings, amount: -45, occurredOn: '2026-08-13' });
  await seedTransaction(db, { accountId, personId: people.Bob, categoryId: categories.Savings, amount: 100, occurredOn: '2026-08-01' });
  await seedTransaction(db, { accountId, personId: people.Bob, categoryId: categories.Groceries, amount: -20, occurredOn: '2026-09-01' });

  return fx;
}

describe('getTransactionsByAccount', () => {
  it('returns every transaction for the account', async () => {
    await withRollback(async (db) => {
      const fx = await seedScenario(db);
      const rows = await getTransactionsByAccount(db, fx.accountId);

      expect(rows).toHaveLength(5);
      expect(rows.map((r) => Number(r.amount)).sort((a, b) => a - b)).toEqual([
        -45, -20, 50, 100, 500,
      ]);
    });
  });

  it('joins person and category in, avoiding a per-row lookup', async () => {
    await withRollback(async (db) => {
      const fx = await seedScenario(db);
      const rows = await getTransactionsByAccount(db, fx.accountId);

      const groceries = rows.find((r) => Number(r.amount) === 50);
      expect(groceries?.person_name).toBe('Alice');
      expect(groceries?.category_name).toBe('Groceries');
      expect(groceries?.person_created_at).toBeTruthy();
    });
  });

  it('orders by date descending', async () => {
    await withRollback(async (db) => {
      const fx = await seedScenario(db);
      const rows = await getTransactionsByAccount(db, fx.accountId);

      expect(rows.map((r) => r.occurred_on)).toEqual([
        '2026-09-01',
        '2026-08-13',
        '2026-08-13',
        '2026-08-01',
        '2026-03-04',
      ]);
    });
  });

  it('returns dates as YYYY-MM-DD strings, not timestamps', async () => {
    await withRollback(async (db) => {
      const fx = await seedScenario(db);
      const rows = await getTransactionsByAccount(db, fx.accountId);
      // Guards the DATE type parser in db/typeParsers.ts: without it these come
      // back as Date objects and serialise to epoch milliseconds.
      expect(rows[0].occurred_on).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it('filters by personIds', async () => {
    await withRollback(async (db) => {
      const fx = await seedScenario(db);
      const rows = await getTransactionsByAccount(db, fx.accountId, {
        personIds: [fx.people.Bob],
      });

      expect(rows).toHaveLength(2);
      expect(rows.every((r) => r.person_name === 'Bob')).toBe(true);
    });
  });

  it('filters by categoryIds', async () => {
    await withRollback(async (db) => {
      const fx = await seedScenario(db);
      const rows = await getTransactionsByAccount(db, fx.accountId, {
        categoryIds: [fx.categories.Savings],
      });

      expect(rows).toHaveLength(3);
      expect(rows.every((r) => r.category_name === 'Savings')).toBe(true);
    });
  });

  it('applies person and category filters together', async () => {
    await withRollback(async (db) => {
      const fx = await seedScenario(db);
      const rows = await getTransactionsByAccount(db, fx.accountId, {
        personIds: [fx.people.Bob],
        categoryIds: [fx.categories.Savings],
      });

      expect(rows).toHaveLength(1);
      expect(Number(rows[0].amount)).toBe(100);
    });
  });

  it('treats an empty filter array as no restriction', async () => {
    await withRollback(async (db) => {
      const fx = await seedScenario(db);
      const rows = await getTransactionsByAccount(db, fx.accountId, {
        personIds: [],
        categoryIds: [],
      });

      expect(rows).toHaveLength(5);
    });
  });

  it('respects limit and offset', async () => {
    await withRollback(async (db) => {
      const fx = await seedScenario(db);

      const firstPage = await getTransactionsByAccount(db, fx.accountId, undefined, 2, 0);
      const secondPage = await getTransactionsByAccount(db, fx.accountId, undefined, 2, 2);

      expect(firstPage).toHaveLength(2);
      expect(secondPage).toHaveLength(2);
      expect(firstPage[0].occurred_on).toBe('2026-09-01');
      expect(secondPage[0].occurred_on).toBe('2026-08-13');
      expect(firstPage.map((r) => r.id)).not.toEqual(secondPage.map((r) => r.id));
    });
  });

  it('excludes transactions belonging to another account', async () => {
    await withRollback(async (db) => {
      const fx = await seedScenario(db);
      const other = await seedBasics(db, {
        people: ['Carol'],
        categories: ['Travel'],
        accountName: 'Other Account',
      });
      await seedTransaction(db, {
        accountId: other.accountId,
        personId: other.people.Carol,
        categoryId: other.categories.Travel,
        amount: 9999,
        occurredOn: '2026-05-05',
      });

      const rows = await getTransactionsByAccount(db, fx.accountId);
      expect(rows).toHaveLength(5);
      expect(rows.some((r) => Number(r.amount) === 9999)).toBe(false);
    });
  });
});

describe('getAccountTotals', () => {
  it('splits credits from debits and reports debits as positive', async () => {
    await withRollback(async (db) => {
      const fx = await seedScenario(db);
      const totals = await getAccountTotals(db, fx.accountId);

      expect(totals.totalCredits).toBe(650);
      expect(totals.totalDebits).toBe(65);
      expect(totals.net).toBe(585);
    });
  });

  it('keeps net equal to credits minus debits', async () => {
    await withRollback(async (db) => {
      const fx = await seedScenario(db);
      const totals = await getAccountTotals(db, fx.accountId);

      expect(totals.net).toBeCloseTo(totals.totalCredits - totals.totalDebits, 2);
    });
  });

  it('returns zeros for an account with no transactions', async () => {
    await withRollback(async (db) => {
      const empty = await seedBasics(db, { people: [], categories: [] });
      const totals = await getAccountTotals(db, empty.accountId);

      expect(totals).toEqual({ totalCredits: 0, totalDebits: 0, net: 0 });
    });
  });

  it('applies the person filter to the totals', async () => {
    await withRollback(async (db) => {
      const fx = await seedScenario(db);
      const totals = await getAccountTotals(db, fx.accountId, {
        personIds: [fx.people.Alice],
      });

      expect(totals.totalCredits).toBe(550);
      expect(totals.totalDebits).toBe(45);
      expect(totals.net).toBe(505);
    });
  });

  it('applies the category filter to the totals', async () => {
    await withRollback(async (db) => {
      const fx = await seedScenario(db);
      const totals = await getAccountTotals(db, fx.accountId, {
        categoryIds: [fx.categories.Groceries],
      });

      expect(totals.totalCredits).toBe(50);
      expect(totals.totalDebits).toBe(20);
      expect(totals.net).toBe(30);
    });
  });

  it('agrees with the filtered row list it sits above', async () => {
    await withRollback(async (db) => {
      const fx = await seedScenario(db);
      const filter = { personIds: [fx.people.Alice] };

      const rows = await getTransactionsByAccount(db, fx.accountId, filter);
      const totals = await getAccountTotals(db, fx.accountId, filter);
      const summed = rows.reduce((acc, r) => acc + Number(r.amount), 0);

      // The two share applyFilter precisely so these can never disagree.
      expect(totals.net).toBeCloseTo(summed, 2);
    });
  });

  it('returns all zeros when the filter excludes everything', async () => {
    await withRollback(async (db) => {
      const fx = await seedScenario(db);
      const totals = await getAccountTotals(db, fx.accountId, { personIds: [-1] });

      expect(totals).toEqual({ totalCredits: 0, totalDebits: 0, net: 0 });
    });
  });
});

describe('createTransaction', () => {
  it('persists the given values', async () => {
    await withRollback(async (db) => {
      const fx = await seedScenario(db);
      const created = await createTransaction(db, {
        accountId: fx.accountId,
        personId: fx.people.Alice,
        categoryId: fx.categories.Savings,
        amount: -12.34,
        description: 'Withdrawal',
        occurredOn: '2026-10-10',
      });

      expect(Number(created.amount)).toBe(-12.34);
      expect(created.occurred_on).toBe('2026-10-10');
      expect(created.description).toBe('Withdrawal');
    });
  });

  it('defaults occurredOn to the database date when omitted', async () => {
    await withRollback(async (db) => {
      const fx = await seedScenario(db);
      const created = await createTransaction(db, {
        accountId: fx.accountId,
        personId: fx.people.Alice,
        categoryId: fx.categories.Savings,
        amount: 1,
        description: null,
      });

      const today = await db.query<{ today: string }>('SELECT CURRENT_DATE::text AS today');
      // Uses SQL CURRENT_DATE rather than Node's UTC date, which would record
      // yesterday when run after local midnight at UTC+2.
      expect(created.occurred_on).toBe(today.rows[0].today);
    });
  });

  it('is rejected by the database when the amount is zero', async () => {
    await withRollback(async (db) => {
      const fx = await seedScenario(db);
      await expect(
        createTransaction(db, {
          accountId: fx.accountId,
          personId: fx.people.Alice,
          categoryId: fx.categories.Savings,
          amount: 0,
          description: null,
        })
      ).rejects.toThrow(/amount_check/);
    });
  });
});

describe('updateTransaction', () => {
  it('changes only the fields provided', async () => {
    await withRollback(async (db) => {
      const fx = await seedScenario(db);
      const id = await seedTransaction(db, {
        accountId: fx.accountId,
        personId: fx.people.Alice,
        categoryId: fx.categories.Savings,
        amount: -50.25,
        occurredOn: '2026-07-07',
        description: 'Original',
      });

      const updated = await updateTransaction(db, id, { description: 'Edited' });

      expect(updated?.description).toBe('Edited');
      // The sign survives an edit that does not mention the amount — the bug
      // where editing a withdrawal silently turned it into a deposit.
      expect(Number(updated?.amount)).toBe(-50.25);
      expect(updated?.occurred_on).toBe('2026-07-07');
      expect(updated?.person_id).toBe(fx.people.Alice);
    });
  });

  it('can clear a description with an explicit null', async () => {
    await withRollback(async (db) => {
      const fx = await seedScenario(db);
      const id = await seedTransaction(db, {
        accountId: fx.accountId,
        personId: fx.people.Alice,
        categoryId: fx.categories.Savings,
        amount: 10,
        occurredOn: '2026-07-07',
        description: 'Remove me',
      });

      const updated = await updateTransaction(db, id, { description: null });
      expect(updated?.description).toBeNull();
    });
  });

  it('returns null for an id that does not exist', async () => {
    await withRollback(async (db) => {
      expect(await updateTransaction(db, -1, { amount: 5 })).toBeNull();
    });
  });
});

describe('getTransactionById / deleteTransaction', () => {
  it('reads back a seeded transaction', async () => {
    await withRollback(async (db) => {
      const fx = await seedScenario(db);
      const id = await seedTransaction(db, {
        accountId: fx.accountId,
        personId: fx.people.Bob,
        categoryId: fx.categories.Savings,
        amount: 77,
        occurredOn: '2026-04-04',
      });

      const found = await getTransactionById(db, id);
      expect(Number(found?.amount)).toBe(77);
    });
  });

  it('deletes and reports whether a row was removed', async () => {
    await withRollback(async (db) => {
      const fx = await seedScenario(db);
      const id = await seedTransaction(db, {
        accountId: fx.accountId,
        personId: fx.people.Bob,
        categoryId: fx.categories.Savings,
        amount: 77,
        occurredOn: '2026-04-04',
      });

      expect(await deleteTransaction(db, id)).toBe(true);
      expect(await getTransactionById(db, id)).toBeNull();
      expect(await deleteTransaction(db, id)).toBe(false);
    });
  });
});

describe('isolation', () => {
  it('leaves nothing behind after a rolled-back test', async () => {
    const before = await withRollback(async (db) => {
      const row = await db.query<{ count: string }>('SELECT count(*) FROM transactions');
      await seedScenario(db);
      return Number(row.rows[0].count);
    });

    const after = await withRollback(async (db) => {
      const row = await db.query<{ count: string }>('SELECT count(*) FROM transactions');
      return Number(row.rows[0].count);
    });

    // Proves the harness actually isolates — the five transactions seeded above
    // are gone. The previous pool.query('BEGIN') version would have failed here.
    expect(after).toBe(before);
  });
});
