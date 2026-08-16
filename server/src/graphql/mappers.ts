/**
 * The single translation layer between database rows and GraphQL.
 *
 * Repositories speak the database's vocabulary (snake_case, numeric ids, NUMERIC
 * columns arriving as strings). The schema speaks its own (camelCase, Float).
 * Every conversion between the two happens here and nowhere else.
 *
 * The return types come from codegen (via `mappers` in codegen.ts), so adding a
 * field to schema.graphql produces one compile error in this file rather than
 * several silently-incomplete objects that only fail at runtime.
 */
import type { AccountWithPeople, AccountPerson } from '../db/repositories/accountsRepo.js';
import type { Person } from '../db/repositories/peopleRepo.js';
import type { TransactionCategory } from '../db/repositories/categoriesRepo.js';
import type { User } from '../db/repositories/usersRepo.js';
import type {
  Transaction,
  TransactionWithRelations,
  AccountTotals,
} from '../db/repositories/transactionsRepo.js';
import type {
  AccountModel,
  AccountTotalsModel,
  CategoryModel,
  PersonModel,
  TransactionModel,
  UserModel,
} from './models.js';

export function toPerson(row: Person | AccountPerson): PersonModel {
  return { id: row.id, name: row.name, createdAt: row.created_at };
}

export function toCategory(row: TransactionCategory): CategoryModel {
  return { id: row.id, name: row.name, createdAt: row.created_at };
}

export function toUser(row: User): UserModel {
  return { id: row.id, email: row.email, createdAt: row.created_at };
}

export function toAccount(row: AccountWithPeople): AccountModel {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    people: row.people.map(toPerson),
    createdAt: row.created_at,
  };
}

export function toTotals(totals: AccountTotals): AccountTotalsModel {
  return {
    totalCredits: totals.totalCredits,
    totalDebits: totals.totalDebits,
    net: totals.net,
  };
}

/**
 * `amount` is NUMERIC(12,2), which node-postgres hands back as a string to avoid
 * float precision loss. The schema declares Float, so it is parsed here.
 */
export function toTransaction(
  row: Transaction,
  person: PersonModel,
  category: CategoryModel
): TransactionModel {
  return {
    id: row.id,
    accountId: row.account_id,
    amount: parseFloat(row.amount),
    description: row.description,
    occurredOn: row.occurred_on,
    createdAt: row.created_at,
    person,
    category,
  };
}

/** For rows from getTransactionsByAccount, which joins both relations in. */
export function toTransactionWithRelations(row: TransactionWithRelations): TransactionModel {
  return toTransaction(
    row,
    { id: row.person_id, name: row.person_name, createdAt: row.person_created_at },
    { id: row.category_id, name: row.category_name, createdAt: row.category_created_at }
  );
}
