import { GraphQLError } from 'graphql';
import { GraphQLContext } from '../../context.js';
import { requireAuth } from '../requireAuth.js';
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

function parseTransactionFilter(filter?: any) {
  if (!filter) return undefined;
  return {
    personIds: filter.personIds ? filter.personIds.map((id: string) => parseInt(id, 10)) : undefined,
    categoryIds: filter.categoryIds ? filter.categoryIds.map((id: string) => parseInt(id, 10)) : undefined,
  };
}

/**
 * Every path that returns a Transaction builds it here, with `person` and
 * `category` already populated. Because they are always present there is no
 * Transaction.person/.category field resolver — graphql-js falls through to the
 * default resolver and simply reads these keys, so listing a page of
 * transactions costs one query instead of one-per-row-per-relation.
 */
function toTransaction(
  row: { id: number; account_id: number; person_id: number; category_id: number; amount: string; description: string | null; occurred_on: string; created_at: string },
  person: { id: number; name: string; created_at: string },
  category: { id: number; name: string; created_at: string }
) {
  return {
    id: row.id,
    accountId: row.account_id,
    amount: parseFloat(row.amount),
    description: row.description,
    occurredOn: row.occurred_on,
    createdAt: row.created_at,
    person: { id: person.id, name: person.name, createdAt: person.created_at },
    category: { id: category.id, name: category.name, createdAt: category.created_at },
  };
}

export const transactionsResolvers = {
  Mutation: {
    createTransaction: async (
      _: unknown,
      {
        input,
      }: {
        input: {
          accountId: string;
          personId: string;
          categoryId: string;
          amount: number;
          description?: string;
          occurredOn?: string;
        };
      },
      context: GraphQLContext
    ) => {
      requireAuth(context);

      const accountId = parseInt(input.accountId, 10);
      const personId = parseInt(input.personId, 10);
      const categoryId = parseInt(input.categoryId, 10);

      const account = await getAccountById(context.pool, accountId);
      if (!account) {
        throw new GraphQLError('Account not found', { extensions: { code: 'NOT_FOUND' } });
      }

      const person = await getPersonById(context.pool, personId);
      if (!person) {
        throw new GraphQLError('Person not found', { extensions: { code: 'NOT_FOUND' } });
      }

      const category = await getCategoryById(context.pool, categoryId);
      if (!category) {
        throw new GraphQLError('Category not found', { extensions: { code: 'NOT_FOUND' } });
      }

      const transaction = await createTransaction(
        context.pool,
        accountId,
        personId,
        categoryId,
        input.amount,
        input.description || null,
        input.occurredOn
      );

      // person and category were already fetched above for validation.
      return toTransaction(transaction, person, category);
    },

    updateTransaction: async (
      _: unknown,
      {
        id,
        input,
      }: {
        id: string;
        input: {
          personId?: string;
          categoryId?: string;
          amount?: number;
          description?: string;
          occurredOn?: string;
        };
      },
      context: GraphQLContext
    ) => {
      requireAuth(context);

      const transactionId = parseInt(id, 10);
      const transaction = await getTransactionById(context.pool, transactionId);
      if (!transaction) {
        throw new GraphQLError('Transaction not found', { extensions: { code: 'NOT_FOUND' } });
      }

      if (input.personId) {
        const person = await getPersonById(context.pool, parseInt(input.personId, 10));
        if (!person) {
          throw new GraphQLError('Person not found', { extensions: { code: 'NOT_FOUND' } });
        }
      }

      if (input.categoryId) {
        const category = await getCategoryById(context.pool, parseInt(input.categoryId, 10));
        if (!category) {
          throw new GraphQLError('Category not found', { extensions: { code: 'NOT_FOUND' } });
        }
      }

      const updated = await updateTransaction(
        context.pool,
        transactionId,
        input.personId ? parseInt(input.personId, 10) : undefined,
        input.categoryId ? parseInt(input.categoryId, 10) : undefined,
        input.amount,
        input.description,
        input.occurredOn
      );

      if (!updated) {
        throw new GraphQLError('Failed to update transaction', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }

      // Read from the updated row rather than the input, so an unchanged
      // person/category still comes back populated.
      const [person, category] = await Promise.all([
        getPersonById(context.pool, updated.person_id),
        getCategoryById(context.pool, updated.category_id),
      ]);

      if (!person || !category) {
        throw new GraphQLError('Failed to load updated transaction', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }

      return toTransaction(updated, person, category);
    },

    deleteTransaction: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      requireAuth(context);

      const transactionId = parseInt(id, 10);
      const transaction = await getTransactionById(context.pool, transactionId);
      if (!transaction) {
        throw new GraphQLError('Transaction not found', { extensions: { code: 'NOT_FOUND' } });
      }

      const deleted = await deleteTransaction(context.pool, transactionId);
      if (!deleted) {
        throw new GraphQLError('Failed to delete transaction', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
      return true;
    },
  },

  Account: {
    transactions: async (
      parent: any,
      { filter, limit, offset }: { filter?: any; limit?: number; offset?: number },
      context: GraphQLContext
    ) => {
      const parsedFilter = parseTransactionFilter(filter);
      const transactions = await getTransactionsByAccount(context.pool, parent.id, parsedFilter, limit, offset);
      return transactions.map((t) =>
        toTransaction(
          t,
          { id: t.person_id, name: t.person_name, created_at: t.person_created_at },
          { id: t.category_id, name: t.category_name, created_at: t.category_created_at }
        )
      );
    },

    totals: async (parent: any, { filter }: { filter?: any }, context: GraphQLContext) => {
      const parsedFilter = parseTransactionFilter(filter);
      const totals = await getAccountTotals(context.pool, parent.id, parsedFilter);
      return {
        totalCredits: totals.totalCredits,
        totalDebits: totals.totalDebits,
        net: totals.net,
      };
    },
  },

  Transaction: {
    account: async (parent: any, _: unknown, context: GraphQLContext) => {
      const account = await getAccountById(context.pool, parent.accountId);
      if (!account) {
        throw new GraphQLError('Account not found', { extensions: { code: 'NOT_FOUND' } });
      }
      return {
        id: account.id,
        name: account.name,
        description: account.description,
        people: account.people,
        createdAt: account.created_at,
      };
    },

    // No person/category resolvers here on purpose — every path that produces a
    // Transaction populates them via toTransaction(), so the default resolver
    // reads them directly. Adding them back would reintroduce the N+1.
  },
};
