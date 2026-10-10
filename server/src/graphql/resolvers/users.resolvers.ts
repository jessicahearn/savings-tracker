import { GraphQLError } from 'graphql';
import { requireAuth } from '../requireAuth.js';
import { toUser } from '../mappers.js';
import type { QueryResolvers, MutationResolvers } from '../generated.js';
import {
  getAllUsers,
  getUserById,
  createUser,
} from '../../db/repositories/usersRepo.js';

function notFound(): never {
  throw new GraphQLError('User not found', { extensions: { code: 'NOT_FOUND' } });
}

const Query: Pick<QueryResolvers, 'users' | 'user'> = {
  users: async (_parent, _args, context) => {
    // requireAuth(context);
    const users = await getAllUsers(context.pool);
    return users.map(toUser);
  },

  user: async (_parent, { id }, context) => {
    requireAuth(context);
    const user = await getUserById(context.pool, parseInt(id, 10));
    if (!user) notFound();
    return toUser(user);
  },
};

export const usersResolvers = { Query };
