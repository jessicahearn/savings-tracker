import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Pool } from 'pg';
import { getTransactionsByAccount, getAccountTotals } from '../repositories/transactionsRepo.js';

let pool: Pool;

beforeAll(async () => {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  await pool.query('BEGIN');
});

afterAll(async () => {
  await pool.query('ROLLBACK');
  await pool.end();
});

describe('transactionsRepo', () => {
  describe('getTransactionsByAccount', () => {
    it('returns all transactions for an account without filter', async () => {
      const result = await getTransactionsByAccount(pool, 1, {}, 50, 0);
      expect(Array.isArray(result)).toBe(true);
    });

    it('filters transactions by personIds', async () => {
      const result = await getTransactionsByAccount(pool, 1, { personIds: [1] }, 50, 0);
      expect(Array.isArray(result)).toBe(true);
    });

    it('filters transactions by categoryIds', async () => {
      const result = await getTransactionsByAccount(pool, 1, { categoryIds: [1] }, 50, 0);
      expect(Array.isArray(result)).toBe(true);
    });

    it('respects limit and offset', async () => {
      const all = await getTransactionsByAccount(pool, 1, {}, 100, 0);
      const limited = await getTransactionsByAccount(pool, 1, {}, 10, 0);
      expect(limited.length).toBeLessThanOrEqual(10);
    });
  });

  describe('getAccountTotals', () => {
    it('calculates totals correctly', async () => {
      const totals = await getAccountTotals(pool, 1, {});
      expect(totals).toHaveProperty('totalCredits');
      expect(totals).toHaveProperty('totalDebits');
      expect(totals).toHaveProperty('net');
      expect(typeof totals.totalCredits).toBe('number');
      expect(typeof totals.totalDebits).toBe('number');
      expect(typeof totals.net).toBe('number');
    });

    it('filters totals by personIds', async () => {
      const totals = await getAccountTotals(pool, 1, { personIds: [1] });
      expect(totals).toHaveProperty('net');
    });

    it('filters totals by categoryIds', async () => {
      const totals = await getAccountTotals(pool, 1, { categoryIds: [1] });
      expect(totals).toHaveProperty('net');
    });
  });
});
