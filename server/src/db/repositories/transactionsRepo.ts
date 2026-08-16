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

/** Fields accepted when creating a transaction. */
export interface CreateTransactionData {
  accountId: number;
  personId: number;
  categoryId: number;
  amount: number;
  description: string | null;
  occurredOn?: string;
}

/** Fields accepted when updating; absent means "leave unchanged". */
export interface UpdateTransactionData {
  personId?: number;
  categoryId?: number;
  amount?: number;
  description?: string | null;
  occurredOn?: string;
}

/**
 * Appends the shared personIds/categoryIds filter clauses to a query, returning
 * the extended SQL and the next free parameter index. Used by both the list and
 * the totals query so the two can never drift apart — if they did, the figures
 * in the totals card would stop matching the rows below them.
 */
function applyFilter(
  query: string,
  params: unknown[],
  filter: TransactionFilter | undefined,
  prefix: string
): { query: string; nextIndex: number } {
  let nextIndex = params.length + 1;

  if (filter?.personIds?.length) {
    query += ` AND ${prefix}person_id = ANY($${nextIndex}::int[])`;
    params.push(filter.personIds);
    nextIndex++;
  }

  if (filter?.categoryIds?.length) {
    query += ` AND ${prefix}category_id = ANY($${nextIndex}::int[])`;
    params.push(filter.categoryIds);
    nextIndex++;
  }

  return { query, nextIndex };
}

export async function getTransactionsByAccount(
  pool: Pool,
  accountId: number,
  filter?: TransactionFilter,
  limit?: number,
  offset?: number
): Promise<TransactionWithRelations[]> {
  const params: unknown[] = [accountId];

  let { query, nextIndex } = applyFilter(
    `SELECT t.*,
            p.name AS person_name,
            p.created_at AS person_created_at,
            c.name AS category_name,
            c.created_at AS category_created_at
     FROM transactions t
     INNER JOIN people p ON p.id = t.person_id
     INNER JOIN transaction_categories c ON c.id = t.category_id
     WHERE t.account_id = $1`,
    params,
    filter,
    't.'
  );

  query += ` ORDER BY t.occurred_on DESC, t.created_at DESC`;

  if (limit !== undefined) {
    query += ` LIMIT $${nextIndex}`;
    params.push(limit);
    nextIndex++;
  }

  if (offset !== undefined) {
    query += ` OFFSET $${nextIndex}`;
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
  const params: unknown[] = [accountId];

  const { query } = applyFilter(
    `SELECT
       COALESCE(SUM(amount) FILTER (WHERE amount > 0), 0)::numeric AS total_credits,
       COALESCE(SUM(amount) FILTER (WHERE amount < 0), 0)::numeric AS total_debits,
       COALESCE(SUM(amount), 0)::numeric AS net
     FROM transactions
     WHERE account_id = $1`,
    params,
    filter,
    ''
  );

  const row = (await pool.query(query, params)).rows[0];

  return {
    totalCredits: parseFloat(row.total_credits) || 0,
    totalDebits: Math.abs(parseFloat(row.total_debits)) || 0,
    net: parseFloat(row.net) || 0,
  };
}

export async function getTransactionById(pool: Pool, id: number): Promise<Transaction | null> {
  const result = await pool.query(`SELECT * FROM transactions WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

export async function createTransaction(
  pool: Pool,
  data: CreateTransactionData
): Promise<Transaction> {
  const result = await pool.query(
    `INSERT INTO transactions (account_id, person_id, category_id, amount, description, occurred_on)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_DATE))
     RETURNING *`,
    [
      data.accountId,
      data.personId,
      data.categoryId,
      data.amount,
      data.description,
      data.occurredOn ?? null,
    ]
  );
  return result.rows[0];
}

export async function updateTransaction(
  pool: Pool,
  id: number,
  data: UpdateTransactionData
): Promise<Transaction | null> {
  const existing = await getTransactionById(pool, id);
  if (!existing) return null;

  const result = await pool.query(
    `UPDATE transactions
     SET person_id = $1, category_id = $2, amount = $3, description = $4,
         occurred_on = $5, updated_at = now()
     WHERE id = $6
     RETURNING *`,
    [
      data.personId ?? existing.person_id,
      data.categoryId ?? existing.category_id,
      data.amount ?? parseFloat(existing.amount),
      data.description !== undefined ? data.description : existing.description,
      data.occurredOn ?? existing.occurred_on,
      id,
    ]
  );
  return result.rows[0] || null;
}

export async function deleteTransaction(pool: Pool, id: number): Promise<boolean> {
  const result = await pool.query(`DELETE FROM transactions WHERE id = $1`, [id]);
  return result.rowCount !== null && result.rowCount > 0;
}
