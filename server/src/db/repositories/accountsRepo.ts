import { Pool, PoolClient } from 'pg';

export interface Account {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

/** A people row as joined onto an account — snake_case, like every other row. */
export interface AccountPerson {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface AccountWithPeople extends Account {
  people: AccountPerson[];
}

/**
 * Fields accepted when creating an account. An object rather than positional
 * parameters so adding a column later does not change any call site's shape,
 * and so `name` and `description` cannot be passed in the wrong order.
 */
export interface CreateAccountData {
  name: string;
  description: string | null;
  personIds?: number[];
}

/** Same, for updates: every field optional, absent meaning "leave unchanged". */
export interface UpdateAccountData {
  name?: string;
  description?: string | null;
  personIds?: number[];
}

const PEOPLE_FOR_ACCOUNT = `
  SELECT p.*
  FROM people p
  INNER JOIN account_people ap ON p.id = ap.person_id
  WHERE ap.account_id = $1
  ORDER BY p.name
`;

async function peopleForAccount(
  db: Pool | PoolClient,
  accountId: number
): Promise<AccountPerson[]> {
  const result = await db.query(PEOPLE_FOR_ACCOUNT, [accountId]);
  return result.rows;
}

async function replaceAccountPeople(
  client: PoolClient,
  accountId: number,
  personIds: number[]
): Promise<void> {
  await client.query(`DELETE FROM account_people WHERE account_id = $1`, [accountId]);
  for (const personId of personIds) {
    await client.query(`INSERT INTO account_people (account_id, person_id) VALUES ($1, $2)`, [
      accountId,
      personId,
    ]);
  }
}

export async function getAllAccounts(pool: Pool): Promise<AccountWithPeople[]> {
  const result = await pool.query(`SELECT * FROM accounts ORDER BY created_at DESC`);
  const accounts = result.rows as Account[];

  return Promise.all(
    accounts.map(async (account) => ({
      ...account,
      people: await peopleForAccount(pool, account.id),
    }))
  );
}

export async function getAccountById(pool: Pool, id: number): Promise<AccountWithPeople | null> {
  const result = await pool.query(`SELECT * FROM accounts WHERE id = $1`, [id]);
  if (result.rows.length === 0) return null;

  const account = result.rows[0] as Account;
  return { ...account, people: await peopleForAccount(pool, id) };
}

export async function createAccount(
  pool: Pool,
  data: CreateAccountData
): Promise<AccountWithPeople> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO accounts (name, description) VALUES ($1, $2) RETURNING *`,
      [data.name, data.description]
    );
    const account = result.rows[0] as Account;

    if (data.personIds?.length) {
      await replaceAccountPeople(client, account.id, data.personIds);
    }

    const people = await peopleForAccount(client, account.id);
    await client.query('COMMIT');

    return { ...account, people };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function updateAccount(
  pool: Pool,
  id: number,
  data: UpdateAccountData
): Promise<AccountWithPeople | null> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const current = await client.query(`SELECT * FROM accounts WHERE id = $1`, [id]);
    if (current.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    const existing = current.rows[0] as Account;
    const result = await client.query(
      `UPDATE accounts SET name = $1, description = $2, updated_at = now()
       WHERE id = $3
       RETURNING *`,
      [
        data.name !== undefined ? data.name : existing.name,
        data.description !== undefined ? data.description : existing.description,
        id,
      ]
    );
    const account = result.rows[0] as Account;

    if (data.personIds !== undefined) {
      await replaceAccountPeople(client, id, data.personIds);
    }

    const people = await peopleForAccount(client, id);
    await client.query('COMMIT');

    return { ...account, people };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteAccount(pool: Pool, id: number): Promise<boolean> {
  const result = await pool.query(`DELETE FROM accounts WHERE id = $1`, [id]);
  return result.rowCount !== null && result.rowCount > 0;
}
