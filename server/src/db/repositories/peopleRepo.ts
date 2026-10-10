import type { Queryable } from '../queryable.js';

export interface Person {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export async function getAllPeople(db: Queryable): Promise<Person[]> {
  const result = await db.query('SELECT * FROM people ORDER BY name ASC');
  return result.rows;
}

export async function getPersonById(db: Queryable, id: number): Promise<Person | null> {
  const result = await db.query('SELECT * FROM people WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function createPerson(db: Queryable, name: string): Promise<Person> {
  const result = await db.query(
    'INSERT INTO people (name) VALUES ($1) RETURNING *',
    [name]
  );
  return result.rows[0];
}

export async function updatePerson(db: Queryable, id: number, name: string): Promise<Person | null> {
  const result = await db.query(
    'UPDATE people SET name = $1, updated_at = now() WHERE id = $2 RETURNING *',
    [name, id]
  );
  return result.rows[0] || null;
}

export async function deletePerson(db: Queryable, id: number): Promise<boolean> {
  const result = await db.query('DELETE FROM people WHERE id = $1', [id]);
  return result.rowCount ? result.rowCount > 0 : false;
}

export async function getTransactionCountForPerson(db: Queryable, personId: number): Promise<number> {
  const result = await db.query(
    'SELECT COUNT(*) FROM transactions WHERE person_id = $1',
    [personId]
  );
  return parseInt(result.rows[0].count, 10);
}

/**
 * account_people.person_id is ON DELETE RESTRICT, so account membership blocks a
 * delete just as transactions do. Without this check the DELETE reaches Postgres
 * and surfaces a raw foreign-key violation instead of a readable message.
 */
export async function getAccountCountForPerson(db: Queryable, personId: number): Promise<number> {
  const result = await db.query(
    'SELECT COUNT(*) FROM account_people WHERE person_id = $1',
    [personId]
  );
  return parseInt(result.rows[0].count, 10);
}

/**
 * scenario_events.person_id is the third ON DELETE RESTRICT reference to people.
 * Every table added that points at people needs a counterpart here, or the
 * friendly blocked-delete message silently reverts to a raw FK violation.
 */
export async function getScenarioEventCountForPerson(
  db: Queryable,
  personId: number
): Promise<number> {
  const result = await db.query(
    'SELECT COUNT(*) FROM scenario_events WHERE person_id = $1',
    [personId]
  );
  return parseInt(result.rows[0].count, 10);
}
