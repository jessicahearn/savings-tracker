import { describe, it, expect, afterAll } from 'vitest';
import { getBalancesByPersonCategory } from '../repositories/transactionsRepo.js';
import { withRollback, closeTestPool, seedBasics, seedTransaction } from './support/testDb.js';
import type { PoolClient } from 'pg';
import type { Fixtures } from './support/testDb.js';

afterAll(closeTestPool);

/**
 * Deliberately spans the cutoff date used throughout, 2026-06-30:
 *
 *   Alice / Groceries   +50.00   2026-03-04   before
 *   Alice / Groceries   +25.00   2026-06-30   ON the cutoff — must be included
 *   Alice / Savings    +500.00   2026-01-15   before
 *   Alice / Savings     -45.00   2026-07-01   after — must be excluded
 *   Bob   / Savings    +100.00   2026-02-01   before
 *   Bob   / Savings    +900.00   2026-12-25   after — must be excluded
 */
async function seedAcrossCutoff(db: PoolClient): Promise<Fixtures> {
  const fx = await seedBasics(db, {
    people: ['Alice', 'Bob'],
    categories: ['Groceries', 'Savings'],
  });
  const { accountId, people, categories } = fx;

  const t = (personId: number, categoryId: number, amount: number, occurredOn: string) =>
    seedTransaction(db, { accountId, personId, categoryId, amount, occurredOn });

  await t(people.Alice, categories.Groceries, 50, '2026-03-04');
  await t(people.Alice, categories.Groceries, 25, '2026-06-30');
  await t(people.Alice, categories.Savings, 500, '2026-01-15');
  await t(people.Alice, categories.Savings, -45, '2026-07-01');
  await t(people.Bob, categories.Savings, 100, '2026-02-01');
  await t(people.Bob, categories.Savings, 900, '2026-12-25');

  return fx;
}

/** Turns the row list into a lookup so assertions read clearly. */
function cells(
  rows: Awaited<ReturnType<typeof getBalancesByPersonCategory>>
): Record<string, number> {
  return Object.fromEntries(rows.map((r) => [`${r.person_id}:${r.category_id}`, r.amount]));
}

describe('getBalancesByPersonCategory', () => {
  it('sums per person and category, including the cutoff date itself', async () => {
    await withRollback(async (db) => {
      const fx = await seedAcrossCutoff(db);
      const grid = cells(
        await getBalancesByPersonCategory(db, fx.accountId, '2026-06-30')
      );

      // 50 + 25, the second landing exactly on the cutoff.
      expect(grid[`${fx.people.Alice}:${fx.categories.Groceries}`]).toBe(75);
      // 500 only; the -45 on 2026-07-01 is past the cutoff.
      expect(grid[`${fx.people.Alice}:${fx.categories.Savings}`]).toBe(500);
      // 100 only; the 900 in December is past the cutoff.
      expect(grid[`${fx.people.Bob}:${fx.categories.Savings}`]).toBe(100);
    });
  });

  it('is inclusive of the cutoff, not exclusive', async () => {
    await withRollback(async (db) => {
      const fx = await seedBasics(db, { people: ['Alice'], categories: ['Savings'] });
      await seedTransaction(db, {
        accountId: fx.accountId,
        personId: fx.people.Alice,
        categoryId: fx.categories.Savings,
        amount: 10,
        occurredOn: '2026-06-30',
      });

      const onCutoff = await getBalancesByPersonCategory(db, fx.accountId, '2026-06-30');
      const dayBefore = await getBalancesByPersonCategory(db, fx.accountId, '2026-06-29');

      expect(onCutoff).toHaveLength(1);
      expect(dayBefore).toHaveLength(0);
    });
  });

  it('omits combinations with no transactions rather than returning zeros', async () => {
    await withRollback(async (db) => {
      const fx = await seedAcrossCutoff(db);
      const rows = await getBalancesByPersonCategory(db, fx.accountId, '2026-06-30');

      // Bob has nothing in Groceries before the cutoff, so there is no row for
      // it — the grid builder is responsible for filling that in as zero.
      expect(rows).toHaveLength(3);
      expect(
        rows.some(
          (r) => r.person_id === fx.people.Bob && r.category_id === fx.categories.Groceries
        )
      ).toBe(false);
    });
  });

  it('nets credits against debits within one cell', async () => {
    await withRollback(async (db) => {
      const fx = await seedBasics(db, { people: ['Alice'], categories: ['Savings'] });
      const t = (amount: number, occurredOn: string) =>
        seedTransaction(db, {
          accountId: fx.accountId,
          personId: fx.people.Alice,
          categoryId: fx.categories.Savings,
          amount,
          occurredOn,
        });
      await t(100, '2026-01-01');
      await t(-30, '2026-02-01');
      await t(-20, '2026-03-01');

      const rows = await getBalancesByPersonCategory(db, fx.accountId, '2026-06-30');
      expect(rows[0].amount).toBe(50);
    });
  });

  it('returns a negative balance when withdrawals exceed deposits', async () => {
    await withRollback(async (db) => {
      const fx = await seedBasics(db, { people: ['Alice'], categories: ['Savings'] });
      await seedTransaction(db, {
        accountId: fx.accountId,
        personId: fx.people.Alice,
        categoryId: fx.categories.Savings,
        amount: -75.5,
        occurredOn: '2026-01-01',
      });

      const rows = await getBalancesByPersonCategory(db, fx.accountId, '2026-06-30');
      expect(rows[0].amount).toBe(-75.5);
    });
  });

  it('returns numbers, not NUMERIC strings', async () => {
    await withRollback(async (db) => {
      const fx = await seedAcrossCutoff(db);
      const rows = await getBalancesByPersonCategory(db, fx.accountId, '2026-06-30');
      expect(typeof rows[0].amount).toBe('number');
    });
  });

  it('filters by personIds', async () => {
    await withRollback(async (db) => {
      const fx = await seedAcrossCutoff(db);
      const rows = await getBalancesByPersonCategory(db, fx.accountId, '2026-06-30', {
        personIds: [fx.people.Bob],
      });

      expect(rows).toHaveLength(1);
      expect(rows[0].person_id).toBe(fx.people.Bob);
      expect(rows[0].amount).toBe(100);
    });
  });

  it('filters by categoryIds', async () => {
    await withRollback(async (db) => {
      const fx = await seedAcrossCutoff(db);
      const rows = await getBalancesByPersonCategory(db, fx.accountId, '2026-06-30', {
        categoryIds: [fx.categories.Groceries],
      });

      expect(rows).toHaveLength(1);
      expect(rows[0].amount).toBe(75);
    });
  });

  it('applies both filters together', async () => {
    await withRollback(async (db) => {
      const fx = await seedAcrossCutoff(db);
      const rows = await getBalancesByPersonCategory(db, fx.accountId, '2026-06-30', {
        personIds: [fx.people.Alice],
        categoryIds: [fx.categories.Savings],
      });

      expect(rows).toHaveLength(1);
      expect(rows[0].amount).toBe(500);
    });
  });

  it('treats empty filter arrays as no restriction', async () => {
    await withRollback(async (db) => {
      const fx = await seedAcrossCutoff(db);
      const rows = await getBalancesByPersonCategory(db, fx.accountId, '2026-06-30', {
        personIds: [],
        categoryIds: [],
      });
      expect(rows).toHaveLength(3);
    });
  });

  it('excludes other accounts', async () => {
    await withRollback(async (db) => {
      const fx = await seedAcrossCutoff(db);
      const other = await seedBasics(db, {
        people: ['Carol'],
        categories: ['Travel'],
        accountName: 'Other',
      });
      await seedTransaction(db, {
        accountId: other.accountId,
        personId: other.people.Carol,
        categoryId: other.categories.Travel,
        amount: 9999,
        occurredOn: '2026-01-01',
      });

      const rows = await getBalancesByPersonCategory(db, fx.accountId, '2026-06-30');
      expect(rows.some((r) => r.amount === 9999)).toBe(false);
    });
  });

  it('returns nothing for an account with no transactions', async () => {
    await withRollback(async (db) => {
      const fx = await seedBasics(db, { people: [], categories: [] });
      expect(await getBalancesByPersonCategory(db, fx.accountId, '2026-06-30')).toEqual([]);
    });
  });
});
