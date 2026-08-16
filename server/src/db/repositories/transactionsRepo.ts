import { Pool } from 'pg';

export interface Transaction {
  id: number;
  account_id: number;
  person_id: number;
  category_id: number;
  amount: string;
  description: string | null;
  occurred_on: string;
  created_at: string;
  updated_at: string;
}

/**
 * A transaction row with its person and category joined in. Listing screens
 * always render both, so fetching them per row would mean one query per
 * transaction per relation (the classic N+1) — a 50-row page cost ~101 queries.
 */
export interface TransactionWithRelations extends Transaction {
  person_name: string;
  person_created_at: string;
  category_name: string;
  category_created_at: string;
}

export interface TransactionFilter {
  personIds?: number[];
  categoryIds?: number[];
}

export interface AccountTotals {
  totalCredits: number;
  totalDebits: number;
  net: number;
}

export async function getTransactionsByAccount(
  pool: Pool,
  accountId: number,
  filter?: TransactionFilter,
  limit?: number,
  offset?: number
): Promise<TransactionWithRelations[]> {
  let query = `
    SELECT t.id, t.account_id, t.person_id, t.category_id, t.amount, t.description,
           t.occurred_on, t.created_at, t.updated_at,
           p.name AS person_name,
           p.created_at AS person_created_at,
           c.name AS category_name,
           c.created_at AS category_created_at
    FROM transactions t
    INNER JOIN people p ON p.id = t.person_id
    INNER JOIN transaction_categories c ON c.id = t.category_id
    WHERE t.account_id = $1
  `;
  const params: any[] = [accountId];
  let paramIndex = 2;

  if (filter?.personIds && filter.personIds.length > 0) {
    query += ` AND t.person_id = ANY($${paramIndex}::int[])`;
    params.push(filter.personIds);
    paramIndex++;
  }

  if (filter?.categoryIds && filter.categoryIds.length > 0) {
    query += ` AND t.category_id = ANY($${paramIndex}::int[])`;
    params.push(filter.categoryIds);
    paramIndex++;
  }

  query += ` ORDER BY t.occurred_on DESC, t.created_at DESC`;

  if (limit !== undefined) {
    query += ` LIMIT $${paramIndex}`;
    params.push(limit);
    paramIndex++;
  }

  if (offset !== undefined) {
    query += ` OFFSET $${paramIndex}`;
    params.push(offset);
  }

  const result = await pool.query(query, params);
  return result.rows;
}

export async function getAccountTotals(
  pool: Pool,
  accountId: number,
  filter?: TransactionFilter
): Promise<AccountTotals> {
  let query = `
    SELECT
      COALESCE(SUM(amount) FILTER (WHERE amount > 0), 0)::numeric AS total_credits,
      COALESCE(SUM(amount) FILTER (WHERE amount < 0), 0)::numeric AS total_debits,
      COALESCE(SUM(amount), 0)::numeric AS net
    FROM transactions
    WHERE account_id = $1
  `;
  const params: any[] = [accountId];
  let paramIndex = 2;

  if (filter?.personIds && filter.personIds.length > 0) {
    query += ` AND person_id = ANY($${paramIndex}::int[])`;
    params.push(filter.personIds);
    paramIndex++;
  }

  if (filter?.categoryIds && filter.categoryIds.length > 0) {
    query += ` AND category_id = ANY($${paramIndex}::int[])`;
    params.push(filter.categoryIds);
    paramIndex++;
  }

  const result = await pool.query(query, params);
  const row = result.rows[0];

  return {
    totalCredits: parseFloat(row.total_credits) || 0,
    totalDebits: Math.abs(parseFloat(row.total_debits)) || 0,
    net: parseFloat(row.net) || 0,
  };
}

export async function getTransactionById(pool: Pool, id: number): Promise<Transaction | null> {
  const result = await pool.query(
    `SELECT id, account_id, person_id, category_id, amount, description, occurred_on, created_at, updated_at
     FROM transactions WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function createTransaction(
  pool: Pool,
  accountId: number,
  personId: number,
  categoryId: number,
  amount: number,
  description: string | null,
  occurredOn?: string
): Promise<Transaction> {
  const result = await pool.query(
    `INSERT INTO transactions (account_id, person_id, category_id, amount, description, occurred_on)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, account_id, person_id, category_id, amount, description, occurred_on, created_at, updated_at`,
    [accountId, personId, categoryId, amount, description, occurredOn || new Date().toISOString().split('T')[0]]
  );
  return result.rows[0];
}

export async function updateTransaction(
  pool: Pool,
  id: number,
  personId?: number,
  categoryId?: number,
  amount?: number,
  description?: string | null,
  occurredOn?: string
): Promise<Transaction | null> {
  const transaction = await getTransactionById(pool, id);
  if (!transaction) {
    return null;
  }

  const result = await pool.query(
    `UPDATE transactions
     SET person_id = $1, category_id = $2, amount = $3, description = $4, occurred_on = $5, updated_at = now()
     WHERE id = $6
     RETURNING id, account_id, person_id, category_id, amount, description, occurred_on, created_at, updated_at`,
    [
      personId !== undefined ? personId : transaction.person_id,
      categoryId !== undefined ? categoryId : transaction.category_id,
      amount !== undefined ? amount : parseFloat(transaction.amount),
      description !== undefined ? description : transaction.description,
      occurredOn !== undefined ? occurredOn : transaction.occurred_on,
      id,
    ]
  );
  return result.rows[0] || null;
}

export async function deleteTransaction(pool: Pool, id: number): Promise<boolean> {
  const result = await pool.query(`DELETE FROM transactions WHERE id = $1`, [id]);
  return result.rowCount !== null && result.rowCount > 0;
}
