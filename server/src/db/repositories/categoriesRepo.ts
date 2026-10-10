import type { Queryable } from '../queryable.js';

export interface TransactionCategory {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export async function getAllCategories(db: Queryable): Promise<TransactionCategory[]> {
  const result = await db.query('SELECT * FROM transaction_categories ORDER BY name ASC');
  return result.rows;
}

export async function getCategoryById(db: Queryable, id: number): Promise<TransactionCategory | null> {
  const result = await db.query('SELECT * FROM transaction_categories WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function createCategory(db: Queryable, name: string): Promise<TransactionCategory> {
  const result = await db.query(
    'INSERT INTO transaction_categories (name) VALUES ($1) RETURNING *',
    [name]
  );
  return result.rows[0];
}

export async function updateCategory(db: Queryable, id: number, name: string): Promise<TransactionCategory | null> {
  const result = await db.query(
    'UPDATE transaction_categories SET name = $1, updated_at = now() WHERE id = $2 RETURNING *',
    [name, id]
  );
  return result.rows[0] || null;
}

export async function deleteCategory(db: Queryable, id: number): Promise<boolean> {
  const result = await db.query('DELETE FROM transaction_categories WHERE id = $1', [id]);
  return result.rowCount ? result.rowCount > 0 : false;
}

export async function getTransactionCountForCategory(db: Queryable, categoryId: number): Promise<number> {
  const result = await db.query(
    'SELECT COUNT(*) FROM transactions WHERE category_id = $1',
    [categoryId]
  );
  return parseInt(result.rows[0].count, 10);
}

/**
 * scenario_events.category_id is also ON DELETE RESTRICT, so a category used
 * only by a scenario event still cannot be deleted.
 */
export async function getScenarioEventCountForCategory(
  db: Queryable,
  categoryId: number
): Promise<number> {
  const result = await db.query(
    'SELECT COUNT(*) FROM scenario_events WHERE category_id = $1',
    [categoryId]
  );
  return parseInt(result.rows[0].count, 10);
}
