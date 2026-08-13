import { GraphQLError } from 'graphql';
import { GraphQLContext } from '../../context.js';
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

function requireAuth(context: GraphQLContext) {
  if (!context.user) {
    throw new GraphQLError('Unauthenticated', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  return context.user;
}

function parseTransactionFilter(filter?: any) {
  if (!filter) return undefined;
  return {
    personIds: filter.personIds ? filter.personIds.map((id: string) => parseInt(id, 10)) : undefined,
    categoryIds: filter.categoryIds ? filter.categoryIds.map((id: string) => parseInt(id, 10)) : undefined,
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

      return {
        id: transaction.id,
        accountId: transaction.account_id,
        personId: transaction.person_id,
        categoryId: transaction.category_id,
        amount: parseFloat(transaction.amount),
        description: transaction.description,
        occurredOn: transaction.occurred_on,
        createdAt: transaction.created_at,
      };
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

      return {
        id: updated.id,
        accountId: updated.account_id,
        personId: updated.person_id,
        categoryId: updated.category_id,
        amount: parseFloat(updated.amount),
        description: updated.description,
        occurredOn: updated.occurred_on,
        createdAt: updated.created_at,
      };
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
      return transactions.map((t) => ({
        id: t.id,
        accountId: t.account_id,
        personId: t.person_id,
        categoryId: t.category_id,
        amount: parseFloat(t.amount),
        description: t.description,
        occurredOn: t.occurred_on,
        createdAt: t.created_at,
      }));
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

    person: async (parent: any, _: unknown, context: GraphQLContext) => {
      const person = await getPersonById(context.pool, parent.personId);
      if (!person) {
        throw new GraphQLError('Person not found', { extensions: { code: 'NOT_FOUND' } });
      }
      return {
        id: person.id,
        name: person.name,
        createdAt: person.created_at,
      };
    },

    category: async (parent: any, _: unknown, context: GraphQLContext) => {
      const category = await getCategoryById(context.pool, parent.categoryId);
      if (!category) {
        throw new GraphQLError('Category not found', { extensions: { code: 'NOT_FOUND' } });
      }
      return {
        id: category.id,
        name: category.name,
        createdAt: category.created_at,
      };
    },
  },
};
