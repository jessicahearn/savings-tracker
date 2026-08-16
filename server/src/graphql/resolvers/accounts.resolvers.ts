import { GraphQLError } from 'graphql';
import { GraphQLContext } from '../../context.js';
import { requireAuth } from '../requireAuth.js';
import {
  getAllAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
} from '../../db/repositories/accountsRepo.js';

export const accountsResolvers = {
  Query: {
    accounts: async (_: unknown, __: unknown, context: GraphQLContext) => {
      requireAuth(context);
      const accounts = await getAllAccounts(context.pool);
      return accounts.map((account) => ({
        id: account.id,
        name: account.name,
        description: account.description,
        people: account.people,
        createdAt: account.created_at,
      }));
    },

    account: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      requireAuth(context);
      const accountId = parseInt(id, 10);
      const account = await getAccountById(context.pool, accountId);
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
  },

  Mutation: {
    createAccount: async (
      _: unknown,
      { input }: { input: { name: string; description?: string; personIds?: string[] } },
      context: GraphQLContext
    ) => {
      requireAuth(context);
      const personIds = (input.personIds || []).map((id) => parseInt(id, 10));
      const account = await createAccount(context.pool, input.name, input.description || null, personIds);
      return {
        id: account.id,
        name: account.name,
        description: account.description,
        people: account.people,
        createdAt: account.created_at,
      };
    },

    updateAccount: async (
      _: unknown,
      { id, input }: { id: string; input: { name?: string; description?: string; personIds?: string[] } },
      context: GraphQLContext
    ) => {
      requireAuth(context);
      const accountId = parseInt(id, 10);
      const account = await getAccountById(context.pool, accountId);
      if (!account) {
        throw new GraphQLError('Account not found', { extensions: { code: 'NOT_FOUND' } });
      }

      const personIds = input.personIds ? input.personIds.map((id) => parseInt(id, 10)) : undefined;
      const updatedAccount = await updateAccount(context.pool, accountId, input.name, input.description, personIds);
      return {
        id: updatedAccount.id,
        name: updatedAccount.name,
        description: updatedAccount.description,
        people: updatedAccount.people,
        createdAt: updatedAccount.created_at,
      };
    },

    deleteAccount: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      requireAuth(context);
      const accountId = parseInt(id, 10);
      const account = await getAccountById(context.pool, accountId);
      if (!account) {
        throw new GraphQLError('Account not found', { extensions: { code: 'NOT_FOUND' } });
      }

      const deleted = await deleteAccount(context.pool, accountId);
      if (!deleted) {
        throw new GraphQLError('Failed to delete account', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
      return true;
    },
  },

  Account: {},
};
