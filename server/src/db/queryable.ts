import type { Pool, PoolClient } from 'pg';

/**
 * Anything that can run a query — the pool itself, or a single checked-out
 * client.
 *
 * Repository functions take this rather than `Pool` so that a caller holding an
 * open transaction can pass its client and have the work join that transaction.
 * That is what makes integration tests able to insert fixtures, assert against
 * them, and roll back: `pool.query()` checks out an arbitrary connection per
 * call, so a `BEGIN` issued on the pool wraps nothing.
 *
 * Functions that manage a transaction themselves (accountsRepo.createAccount,
 * updateAccount) still take `Pool`, since they need `.connect()`.
 */
export type Queryable = Pool | PoolClient;
