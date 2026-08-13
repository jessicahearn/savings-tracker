import { Pool, QueryResult } from 'pg';

export interface Account {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccountWithPeople extends Account {
  people: Array<{ id: number; name: string }>;
}

export async function getAllAccounts(pool: Pool): Promise<AccountWithPeople[]> {
  const result = await pool.query(`
    SELECT DISTINCT
      a.id,
      a.name,
      a.description,
      a.created_at,
      a.updated_at
    FROM accounts a
    ORDER BY a.created_at DESC
  `);

  const accounts = result.rows as Account[];

  const accountsWithPeople = await Promise.all(
    accounts.map(async (account) => {
      const peopleResult = await pool.query(
        `SELECT p.id, p.name FROM people p
         INNER JOIN account_people ap ON p.id = ap.person_id
         WHERE ap.account_id = $1
         ORDER BY p.name`,
        [account.id]
      );
      return {
        ...account,
        people: peopleResult.rows,
      };
    })
  );

  return accountsWithPeople;
}

export async function getAccountById(pool: Pool, id: number): Promise<AccountWithPeople | null> {
  const result = await pool.query(
    `SELECT id, name, description, created_at, updated_at FROM accounts WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const account = result.rows[0] as Account;

  const peopleResult = await pool.query(
    `SELECT p.id, p.name FROM people p
     INNER JOIN account_people ap ON p.id = ap.person_id
     WHERE ap.account_id = $1
     ORDER BY p.name`,
    [id]
  );

  return {
    ...account,
    people: peopleResult.rows,
  };
}

export async function createAccount(
  pool: Pool,
  name: string,
  description: string | null,
  personIds: number[] = []
): Promise<AccountWithPeople> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO accounts (name, description) VALUES ($1, $2)
       RETURNING id, name, description, created_at, updated_at`,
      [name, description]
    );

    const account = result.rows[0] as Account;

    if (personIds.length > 0) {
      for (const personId of personIds) {
        await client.query(
          `INSERT INTO account_people (account_id, person_id) VALUES ($1, $2)`,
          [account.id, personId]
        );
      }
    }

    await client.query('COMMIT');

    const peopleResult = await pool.query(
      `SELECT p.id, p.name FROM people p
       INNER JOIN account_people ap ON p.id = ap.person_id
       WHERE ap.account_id = $1
       ORDER BY p.name`,
      [account.id]
    );

    return {
      ...account,
      people: peopleResult.rows,
    };
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
  name?: string,
  description?: string | null,
  personIds?: number[]
): Promise<AccountWithPeople> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const getResult = await client.query(`SELECT id, name, description FROM accounts WHERE id = $1`, [id]);
    if (getResult.rows.length === 0) {
      throw new Error('Account not found');
    }

    const currentAccount = getResult.rows[0];
    const updatedName = name !== undefined ? name : currentAccount.name;
    const updatedDescription = description !== undefined ? description : currentAccount.description;

    const updateResult = await client.query(
      `UPDATE accounts SET name = $1, description = $2, updated_at = now()
       WHERE id = $3
       RETURNING id, name, description, created_at, updated_at`,
      [updatedName, updatedDescription, id]
    );

    const account = updateResult.rows[0] as Account;

    if (personIds !== undefined) {
      await client.query(`DELETE FROM account_people WHERE account_id = $1`, [id]);

      for (const personId of personIds) {
        await client.query(
          `INSERT INTO account_people (account_id, person_id) VALUES ($1, $2)`,
          [id, personId]
        );
      }
    }

    await client.query('COMMIT');

    const peopleResult = await pool.query(
      `SELECT p.id, p.name FROM people p
       INNER JOIN account_people ap ON p.id = ap.person_id
       WHERE ap.account_id = $1
       ORDER BY p.name`,
      [id]
    );

    return {
      ...account,
      people: peopleResult.rows,
    };
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
