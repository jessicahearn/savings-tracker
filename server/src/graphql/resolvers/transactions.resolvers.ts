import { GraphQLError } from 'graphql';
import { requireAuth } from '../requireAuth.js';
import {
  toAccount,
  toCategory,
  toPerson,
  toTotals,
  toTransaction,
  toTransactionFilter,
  toTransactionWithRelations,
} from '../mappers.js';
import type { MutationResolvers, AccountResolvers, TransactionResolvers } from '../generated.js';
import {
  getTransactionsByAccount,
  getAccountTotals,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../../db/repositories/transactionsRepo.js';
import { getAccountById } from '../../db/repositories/accountsRepo.js';
import { getPersonById } from '../../db/repositories/peopleRepo.js';
import { getCategoryById } from '../../db/repositories/categoriesRepo.js';
import type { GraphQLContext } from '../../context.js';

/** Loads the person and category for a transaction row, erroring if either is missing. */
async function relationsFor(context: GraphQLContext, personId: number, categoryId: number) {
  const [person, category] = await Promise.all([
    getPersonById(context.pool, personId),
    getCategoryById(context.pool, categoryId),
  ]);
  if (!person) {
    throw new GraphQLError('Person not found', { extensions: { code: 'NOT_FOUND' } });
  }
  if (!category) {
    throw new GraphQLError('Category not found', { extensions: { code: 'NOT_FOUND' } });
  }
  return { person: toPerson(person), category: toCategory(category) };
}

const Mutation: Pick<
  MutationResolvers,
  'createTransaction' | 'updateTransaction' | 'deleteTransaction'
> = {
  createTransaction: async (_parent, { input }, context) => {
    requireAuth(context);

    const accountId = parseInt(input.accountId, 10);
    const personId = parseInt(input.personId, 10);
    const categoryId = parseInt(input.categoryId, 10);

    const account = await getAccountById(context.pool, accountId);
    if (!account) {
      throw new GraphQLError('Account not found', { extensions: { code: 'NOT_FOUND' } });
    }

    const { person, category } = await relationsFor(context, personId, categoryId);

    const transaction = await createTransaction(context.pool, {
      accountId,
      personId,
      categoryId,
      amount: input.amount,
      description: input.description ?? null,
      occurredOn: input.occurredOn ?? undefined,
    });

    return toTransaction(transaction, person, category);
  },

  updateTransaction: async (_parent, { id, input }, context) => {
    requireAuth(context);
    const transactionId = parseInt(id, 10);

    const existing = await getTransactionById(context.pool, transactionId);
    if (!existing) {
      throw new GraphQLError('Transaction not found', { extensions: { code: 'NOT_FOUND' } });
    }

    const updated = await updateTransaction(context.pool, transactionId, {
      personId: input.personId ? parseInt(input.personId, 10) : undefined,
      categoryId: input.categoryId ? parseInt(input.categoryId, 10) : undefined,
      amount: input.amount ?? undefined,
      description: input.description,
      occurredOn: input.occurredOn ?? undefined,
    });

    if (!updated) {
      throw new GraphQLError('Failed to update transaction', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }

    // Read from the updated row rather than the input, so an unchanged
    // person/category still comes back populated.
    const { person, category } = await relationsFor(
      context,
      updated.person_id,
      updated.category_id
    );

    return toTransaction(updated, person, category);
  },

  deleteTransaction: async (_parent, { id }, context) => {
    requireAuth(context);
    const transactionId = parseInt(id, 10);

    const transaction = await getTransactionById(context.pool, transactionId);
    if (!transaction) {
      throw new GraphQLError('Transaction not found', { extensions: { code: 'NOT_FOUND' } });
    }

    const deleted = await deleteTransaction(context.pool, transactionId);
    if (!deleted) {
      throw new GraphQLError('Failed to delete transaction', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
    return true;
  },
};

const Account: Pick<AccountResolvers, 'transactions' | 'totals'> = {
  transactions: async (parent, { filter, limit, offset }, context) => {
    const rows = await getTransactionsByAccount(
      context.pool,
      parent.id,
      toTransactionFilter(filter),
      limit ?? undefined,
      offset ?? undefined
    );
    return rows.map(toTransactionWithRelations);
  },

  totals: async (parent, { filter }, context) => {
    return toTotals(await getAccountTotals(context.pool, parent.id, toTransactionFilter(filter)));
  },
};

const Transaction: Pick<TransactionResolvers, 'account'> = {
  // person/category are always populated by the mappers, so they need no field
  // resolvers — graphql-js falls through to the default resolver and reads the
  // keys directly. Adding them back would reintroduce an N+1 on every list.
  account: async (parent, _args, context) => {
    const account = await getAccountById(context.pool, parent.accountId);
    if (!account) {
      throw new GraphQLError('Account not found', { extensions: { code: 'NOT_FOUND' } });
    }
    return toAccount(account);
  },
};

export const transactionsResolvers = { Mutation, Account, Transaction };
