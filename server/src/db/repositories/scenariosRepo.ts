import type { Queryable } from '../queryable.js';
import type { RecurrenceUnit } from '../../lib/recurrence.js';

export interface Scenario {
  id: number;
  account_id: number;
  name: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface ScenarioEvent {
  id: number;
  scenario_id: number;
  person_id: number;
  category_id: number;
  /** NUMERIC(12,2) arrives as a string; mappers parse it. */
  amount: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  recurrence_interval: number | null;
  recurrence_unit: RecurrenceUnit | null;
  created_at: string;
  updated_at: string;
}

/**
 * An event with its person and category joined in, for the same reason the
 * transaction list does it: the scenario page renders both for every event, and
 * resolving them per row would be an N+1.
 */
export interface ScenarioEventWithRelations extends ScenarioEvent {
  person_name: string;
  person_created_at: string;
  category_name: string;
  category_created_at: string;
}

export interface CreateScenarioData {
  accountId: number;
  name: string;
  startDate: string;
  endDate: string;
}

/** Absent means "leave unchanged". */
export interface UpdateScenarioData {
  name?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateScenarioEventData {
  scenarioId: number;
  personId: number;
  categoryId: number;
  amount: number;
  description: string | null;
  startDate: string;
  endDate: string | null;
  /** Both null for a one-time event; the database enforces the pairing. */
  recurrenceInterval: number | null;
  recurrenceUnit: RecurrenceUnit | null;
}

/**
 * Absent means "leave unchanged"; an explicit null clears the field. That
 * distinction matters here — removing an end date or converting a recurring
 * event to a one-time one both require writing null.
 */
export interface UpdateScenarioEventData {
  personId?: number;
  categoryId?: number;
  amount?: number;
  description?: string | null;
  startDate?: string;
  endDate?: string | null;
  recurrenceInterval?: number | null;
  recurrenceUnit?: RecurrenceUnit | null;
}

/**
 * Chooses the incoming value when the caller supplied one, falling back to what
 * is already stored. Uses `!== undefined` rather than `??` so that an explicit
 * null clears a field instead of being mistaken for "not provided".
 */
function pick<T>(incoming: T | undefined, existing: T): T {
  return incoming !== undefined ? incoming : existing;
}

const EVENT_WITH_RELATIONS = `
  SELECT e.*,
         p.name AS person_name,
         p.created_at AS person_created_at,
         c.name AS category_name,
         c.created_at AS category_created_at
  FROM scenario_events e
  INNER JOIN people p ON p.id = e.person_id
  INNER JOIN transaction_categories c ON c.id = e.category_id
`;

export async function getScenariosByAccount(
  db: Queryable,
  accountId: number
): Promise<Scenario[]> {
  const result = await db.query(
    `SELECT * FROM scenarios WHERE account_id = $1 ORDER BY start_date DESC, name ASC`,
    [accountId]
  );
  return result.rows;
}

export async function getScenarioById(db: Queryable, id: number): Promise<Scenario | null> {
  const result = await db.query(`SELECT * FROM scenarios WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

export async function createScenario(
  db: Queryable,
  data: CreateScenarioData
): Promise<Scenario> {
  const result = await db.query(
    `INSERT INTO scenarios (account_id, name, start_date, end_date)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.accountId, data.name, data.startDate, data.endDate]
  );
  return result.rows[0];
}

export async function updateScenario(
  db: Queryable,
  id: number,
  data: UpdateScenarioData
): Promise<Scenario | null> {
  const existing = await getScenarioById(db, id);
  if (!existing) return null;

  const result = await db.query(
    `UPDATE scenarios
     SET name = $1, start_date = $2, end_date = $3, updated_at = now()
     WHERE id = $4
     RETURNING *`,
    [
      pick(data.name, existing.name),
      pick(data.startDate, existing.start_date),
      pick(data.endDate, existing.end_date),
      id,
    ]
  );
  return result.rows[0] || null;
}

/** Events go with it — scenario_events.scenario_id is ON DELETE CASCADE. */
export async function deleteScenario(db: Queryable, id: number): Promise<boolean> {
  const result = await db.query(`DELETE FROM scenarios WHERE id = $1`, [id]);
  return result.rowCount !== null && result.rowCount > 0;
}

export async function getEventsByScenario(
  db: Queryable,
  scenarioId: number
): Promise<ScenarioEventWithRelations[]> {
  const result = await db.query(
    `${EVENT_WITH_RELATIONS} WHERE e.scenario_id = $1 ORDER BY e.start_date ASC, e.id ASC`,
    [scenarioId]
  );
  return result.rows;
}

export async function getScenarioEventById(
  db: Queryable,
  id: number
): Promise<ScenarioEvent | null> {
  const result = await db.query(`SELECT * FROM scenario_events WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

export async function createScenarioEvent(
  db: Queryable,
  data: CreateScenarioEventData
): Promise<ScenarioEvent> {
  const result = await db.query(
    `INSERT INTO scenario_events
       (scenario_id, person_id, category_id, amount, description,
        start_date, end_date, recurrence_interval, recurrence_unit)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      data.scenarioId,
      data.personId,
      data.categoryId,
      data.amount,
      data.description,
      data.startDate,
      data.endDate,
      data.recurrenceInterval,
      data.recurrenceUnit,
    ]
  );
  return result.rows[0];
}

export async function updateScenarioEvent(
  db: Queryable,
  id: number,
  data: UpdateScenarioEventData
): Promise<ScenarioEvent | null> {
  const existing = await getScenarioEventById(db, id);
  if (!existing) return null;

  const result = await db.query(
    `UPDATE scenario_events
     SET person_id = $1, category_id = $2, amount = $3, description = $4,
         start_date = $5, end_date = $6,
         recurrence_interval = $7, recurrence_unit = $8,
         updated_at = now()
     WHERE id = $9
     RETURNING *`,
    [
      pick(data.personId, existing.person_id),
      pick(data.categoryId, existing.category_id),
      pick(data.amount, parseFloat(existing.amount)),
      pick(data.description, existing.description),
      pick(data.startDate, existing.start_date),
      pick(data.endDate, existing.end_date),
      pick(data.recurrenceInterval, existing.recurrence_interval),
      pick(data.recurrenceUnit, existing.recurrence_unit),
      id,
    ]
  );
  return result.rows[0] || null;
}

export async function deleteScenarioEvent(db: Queryable, id: number): Promise<boolean> {
  const result = await db.query(`DELETE FROM scenario_events WHERE id = $1`, [id]);
  return result.rowCount !== null && result.rowCount > 0;
}
