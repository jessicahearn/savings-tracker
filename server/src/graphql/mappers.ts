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
  TransactionFilter as RepoTransactionFilter,
} from '../db/repositories/transactionsRepo.js';
import type {
  Scenario,
  ScenarioEventWithRelations,
} from '../db/repositories/scenariosRepo.js';
import type { ScenarioGrid as BuiltGrid, GridData as BuiltGridData } from '../lib/scenarioGrid.js';
import type {
  AccountModel,
  AccountTotalsModel,
  CategoryModel,
  GridDataModel,
  PersonModel,
  ScenarioEventModel,
  ScenarioGridModel,
  ScenarioModel,
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

/**
 * GraphQL ids arrive as strings; the repositories work in integers. Shared by
 * the transaction list, the account totals and the scenario grid so all three
 * read one filter the same way.
 */
export function toTransactionFilter(
  filter?: { personIds?: string[] | null; categoryIds?: string[] | null } | null
): RepoTransactionFilter | undefined {
  if (!filter) return undefined;
  return {
    personIds: filter.personIds?.map((id) => parseInt(id, 10)),
    categoryIds: filter.categoryIds?.map((id) => parseInt(id, 10)),
  };
}

export function toScenario(row: Scenario): ScenarioModel {
  return {
    id: row.id,
    accountId: row.account_id,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
  };
}

export function toScenarioEvent(row: ScenarioEventWithRelations): ScenarioEventModel {
  return {
    id: row.id,
    amount: parseFloat(row.amount),
    description: row.description,
    startDate: row.start_date,
    endDate: row.end_date,
    recurrenceInterval: row.recurrence_interval,
    recurrenceUnit: row.recurrence_unit,
    createdAt: row.created_at,
    person: { id: row.person_id, name: row.person_name, createdAt: row.person_created_at },
    category: {
      id: row.category_id,
      name: row.category_name,
      createdAt: row.category_created_at,
    },
  };
}

/**
 * buildScenarioGrid works with bare {id, name} axis items and identifies rows by
 * personId, since `src/lib/` has no business knowing what a GraphQL Person is.
 * Resolving those ids back to full objects is this layer's job.
 */
function toGridData(data: BuiltGridData, peopleById: Map<number, PersonModel>): GridDataModel {
  return {
    rows: data.rows.map((row) => {
      const person = peopleById.get(row.personId);
      if (!person) {
        // Unreachable: the grid only emits rows for axis members, and the axes
        // are built from this same list.
        throw new Error(`Grid row references unknown person ${row.personId}`);
      }
      return {
        person,
        cells: row.cells.map((cell) => ({
          categoryId: cell.categoryId,
          amount: cell.amount,
        })),
        total: row.total,
      };
    }),
    columnTotals: data.columnTotals,
    grandTotal: data.grandTotal,
  };
}

export function toScenarioGrid(
  grid: BuiltGrid,
  people: PersonModel[],
  categories: CategoryModel[]
): ScenarioGridModel {
  const peopleById = new Map(people.map((p) => [p.id, p]));
  const categoriesById = new Map(categories.map((c) => [c.id, c]));

  // The axes the grid actually used, after filtering — not the candidates it
  // was given.
  const axisPeople = grid.people.map((p) => peopleById.get(p.id)!).filter(Boolean);
  const axisCategories = grid.categories.map((c) => categoriesById.get(c.id)!).filter(Boolean);

  return {
    people: axisPeople,
    categories: axisCategories,
    baseline: toGridData(grid.baseline, peopleById),
    projected: toGridData(grid.projected, peopleById),
  };
}
