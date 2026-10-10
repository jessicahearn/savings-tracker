/**
 * Integration-test harness: a dedicated test database plus a transaction that
 * rolls back after every test. The same two mechanisms Rails combines, and they
 * solve different problems:
 *
 *  - the separate database keeps dev data untouched and safe to reset
 *  - the per-test transaction keeps tests independent of each other and of
 *    execution order, without truncating tables between them
 *
 * Note this file is named `testDb.ts`, not `*.test.ts`, so vitest does not
 * collect it as a suite.
 */
import { Pool, type PoolClient } from 'pg';

let pool: Pool | null = null;

function testPool(): Pool {
  if (pool) return pool;

  const connectionString = process.env.TEST_DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'TEST_DATABASE_URL is not set. Copy it from .env.example, then run:\n' +
        '  npm run db:test:prepare -w server'
    );
  }

  // Belt and braces: the whole point of this harness is that tests cannot reach
  // real data, so refuse a URL that is not obviously a test database.
  const databaseName = new URL(connectionString).pathname.replace(/^\//, '');
  if (!/_test$/.test(databaseName)) {
    throw new Error(
      `Refusing to run tests against "${databaseName}" — TEST_DATABASE_URL must point at a database ending in "_test".`
    );
  }

  pool = new Pool({ connectionString });
  return pool;
}

/** Closes the shared pool. Call from a top-level afterAll. */
export async function closeTestPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Runs `fn` inside a transaction on a single checked-out client, then rolls
 * back whatever it did.
 *
 * The client must be threaded through to the code under test — that is why
 * repository functions take `Queryable` rather than `Pool`. Calling
 * `pool.query('BEGIN')` instead would issue the BEGIN on an arbitrary pooled
 * connection and wrap nothing at all.
 */
export async function withRollback<T>(fn: (db: PoolClient) => Promise<T>): Promise<T> {
  const client = await testPool().connect();
  try {
    await client.query('BEGIN');
    return await fn(client);
  } finally {
    await client.query('ROLLBACK');
    client.release();
  }
}

export interface Fixtures {
  accountId: number;
  /** Keyed by the name passed in, so tests can read assertions clearly. */
  people: Record<string, number>;
  categories: Record<string, number>;
}

/**
 * Inserts a known account, people and categories. Everything the tests assert
 * against is created here, so assertions can check real values rather than just
 * shapes.
 */
export async function seedBasics(
  db: PoolClient,
  options: { people: string[]; categories: string[]; accountName?: string }
): Promise<Fixtures> {
  const account = await db.query(
    `INSERT INTO accounts (name, description) VALUES ($1, $2) RETURNING id`,
    [options.accountName ?? 'Test Account', null]
  );
  const accountId: number = account.rows[0].id;

  const people: Record<string, number> = {};
  for (const name of options.people) {
    const row = await db.query(`INSERT INTO people (name) VALUES ($1) RETURNING id`, [name]);
    people[name] = row.rows[0].id;
    await db.query(
      `INSERT INTO account_people (account_id, person_id) VALUES ($1, $2)`,
      [accountId, people[name]]
    );
  }

  const categories: Record<string, number> = {};
  for (const name of options.categories) {
    const row = await db.query(
      `INSERT INTO transaction_categories (name) VALUES ($1) RETURNING id`,
      [name]
    );
    categories[name] = row.rows[0].id;
  }

  return { accountId, people, categories };
}

/** Inserts one transaction and returns its id. */
export async function seedTransaction(
  db: PoolClient,
  row: {
    accountId: number;
    personId: number;
    categoryId: number;
    amount: number;
    occurredOn: string;
    description?: string | null;
  }
): Promise<number> {
  const result = await db.query(
    `INSERT INTO transactions (account_id, person_id, category_id, amount, occurred_on, description)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [
      row.accountId,
      row.personId,
      row.categoryId,
      row.amount,
      row.occurredOn,
      row.description ?? null,
    ]
  );
  return result.rows[0].id;
}
