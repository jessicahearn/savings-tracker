import { GraphQLError } from 'graphql';
import { requireAuth } from '../requireAuth.js';
import { toAccount } from '../mappers.js';
import type { QueryResolvers, MutationResolvers } from '../generated.js';
import {
  getAllAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
} from '../../db/repositories/accountsRepo.js';

function notFound(): never {
  throw new GraphQLError('Account not found', { extensions: { code: 'NOT_FOUND' } });
}

const Query: Pick<QueryResolvers, 'accounts' | 'account'> = {
  accounts: async (_parent, _args, context) => {
    requireAuth(context);
    const accounts = await getAllAccounts(context.pool);
    return accounts.map(toAccount);
  },

  account: async (_parent, { id }, context) => {
    requireAuth(context);
    const account = await getAccountById(context.pool, parseInt(id, 10));
    if (!account) notFound();
    return toAccount(account);
  },
};

const Mutation: Pick<MutationResolvers, 'createAccount' | 'updateAccount' | 'deleteAccount'> = {
  createAccount: async (_parent, { input }, context) => {
    requireAuth(context);
    const account = await createAccount(context.pool, {
      name: input.name,
      description: input.description ?? null,
      personIds: (input.personIds ?? []).map((id) => parseInt(id, 10)),
    });
    return toAccount(account);
  },

  updateAccount: async (_parent, { id, input }, context) => {
    requireAuth(context);
    const account = await updateAccount(context.pool, parseInt(id, 10), {
      name: input.name ?? undefined,
      description: input.description,
      personIds: input.personIds ? input.personIds.map((pid) => parseInt(pid, 10)) : undefined,
    });
    if (!account) notFound();
    return toAccount(account);
  },

  deleteAccount: async (_parent, { id }, context) => {
    requireAuth(context);
    const accountId = parseInt(id, 10);

    const account = await getAccountById(context.pool, accountId);
    if (!account) notFound();

    const deleted = await deleteAccount(context.pool, accountId);
    if (!deleted) {
      throw new GraphQLError('Failed to delete account', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
    return true;
  },
};

export const accountsResolvers = { Query, Mutation };
