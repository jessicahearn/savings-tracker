/**
 * The internal shapes resolvers pass around, as distinct from the shapes the
 * schema exposes.
 *
 * These are *derived from* the generated schema types rather than hand-written,
 * and that is the whole point. A hand-written model drifts silently: adding a
 * field to schema.graphql would leave the model stale, every mapper would keep
 * compiling, and the gap would only surface at runtime as "Cannot return null
 * for non-nullable field". Deriving them means a new schema field lands in the
 * model, which breaks the one mapper that builds it — a single compile error in
 * mappers.ts pointing exactly at the code that needs updating.
 *
 * Two kinds of deviation from the schema types are declared explicitly below:
 *
 *  - fields resolved elsewhere are omitted (an Account produced by
 *    accounts.resolvers has no `transactions` or `totals`; those are filled in
 *    later by field resolvers in transactions.resolvers)
 *  - ids stay numbers internally and are serialised to strings by the ID scalar
 *
 * codegen points at these via `mappers` in codegen.ts, so a resolver's `parent`
 * argument and its return type are both checked against these.
 */
import type {
  Account as SchemaAccount,
  AccountTotals as SchemaAccountTotals,
  AuthPayload as SchemaAuthPayload,
  Person as SchemaPerson,
  Transaction as SchemaTransaction,
  TransactionCategory as SchemaCategory,
  User as SchemaUser,
} from './generated.js';

/** Fields every model drops: the typename marker and the string-serialised id. */
type Internal<T> = Omit<T, '__typename' | 'id'> & { id: number };

export type PersonModel = Internal<SchemaPerson>;

export type CategoryModel = Internal<SchemaCategory>;

export type UserModel = Internal<SchemaUser>;

export type AccountTotalsModel = Omit<SchemaAccountTotals, '__typename'>;

export type AccountModel = Omit<
  Internal<SchemaAccount>,
  // resolved separately by transactions.resolvers
  'transactions' | 'totals' | 'people'
> & {
  people: PersonModel[];
};

export type TransactionModel = Omit<
  Internal<SchemaTransaction>,
  // `account` is resolved separately; `accountId` is kept so it can be
  'account' | 'person' | 'category'
> & {
  accountId: number;
  person: PersonModel;
  category: CategoryModel;
};

export type AuthPayloadModel = Omit<SchemaAuthPayload, '__typename' | 'user'> & {
  user: UserModel;
};
