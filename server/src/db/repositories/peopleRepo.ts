import { Pool } from 'pg';

export interface Person {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export async function getAllPeople(pool: Pool): Promise<Person[]> {
  const result = await pool.query('SELECT * FROM people ORDER BY name ASC');
  return result.rows;
}

export async function getPersonById(pool: Pool, id: number): Promise<Person | null> {
  const result = await pool.query('SELECT * FROM people WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function createPerson(pool: Pool, name: string): Promise<Person> {
  const result = await pool.query(
    'INSERT INTO people (name) VALUES ($1) RETURNING *',
    [name]
  );
  return result.rows[0];
}

export async function updatePerson(pool: Pool, id: number, name: string): Promise<Person | null> {
  const result = await pool.query(
    'UPDATE people SET name = $1, updated_at = now() WHERE id = $2 RETURNING *',
    [name, id]
  );
  return result.rows[0] || null;
}

export async function deletePerson(pool: Pool, id: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM people WHERE id = $1', [id]);
  return result.rowCount ? result.rowCount > 0 : false;
}

export async function getTransactionCountForPerson(pool: Pool, personId: number): Promise<number> {
  const result = await pool.query(
    'SELECT COUNT(*) FROM transactions WHERE person_id = $1',
    [personId]
  );
  return parseInt(result.rows[0].count, 10);
}
