import { Pool } from 'pg';

export interface TransactionCategory {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export async function getAllCategories(pool: Pool): Promise<TransactionCategory[]> {
  const result = await pool.query('SELECT * FROM transaction_categories ORDER BY name ASC');
  return result.rows;
}

export async function getCategoryById(pool: Pool, id: number): Promise<TransactionCategory | null> {
  const result = await pool.query('SELECT * FROM transaction_categories WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function createCategory(pool: Pool, name: string): Promise<TransactionCategory> {
  const result = await pool.query(
    'INSERT INTO transaction_categories (name) VALUES ($1) RETURNING *',
    [name]
  );
  return result.rows[0];
}

export async function updateCategory(pool: Pool, id: number, name: string): Promise<TransactionCategory | null> {
  const result = await pool.query(
    'UPDATE transaction_categories SET name = $1, updated_at = now() WHERE id = $2 RETURNING *',
    [name, id]
  );
  return result.rows[0] || null;
}

export async function deleteCategory(pool: Pool, id: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM transaction_categories WHERE id = $1', [id]);
  return result.rowCount ? result.rowCount > 0 : false;
}

export async function getTransactionCountForCategory(pool: Pool, categoryId: number): Promise<number> {
  const result = await pool.query(
    'SELECT COUNT(*) FROM transactions WHERE category_id = $1',
    [categoryId]
  );
  return parseInt(result.rows[0].count, 10);
}
