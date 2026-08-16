import { GraphQLError } from 'graphql';
import { requireAuth } from '../requireAuth.js';
import { toUser } from '../mappers.js';
import type { QueryResolvers, MutationResolvers } from '../generated.js';
import { hashPassword, verifyPassword } from '../../auth/password.js';
import { getUserByEmail, getUserById, createUser } from '../../db/repositories/usersRepo.js';

const Query: Pick<QueryResolvers, 'me'> = {
  me: async (_parent, _args, context) => {
    if (!context.user) return null;

    // The session only carries { id, email }, so read the row for the real
    // createdAt. This also returns null for a session whose user has since
    // been deleted, which sends the client back to /login.
    const user = await getUserById(context.pool, context.user.id);
    return user ? toUser(user) : null;
  },
};

const Mutation: Pick<MutationResolvers, 'signup' | 'signIn' | 'signOut'> = {
  signup: async (_parent, { input }, context) => {
    const existingUser = await getUserByEmail(context.pool, input.email);
    if (existingUser) {
      throw new GraphQLError('Email already in use', { extensions: { code: 'BAD_REQUEST' } });
    }

    const user = await createUser(context.pool, {
      email: input.email,
      passwordHash: await hashPassword(input.password),
    });

    (context.req.session as any).user = { id: user.id, email: user.email };

    return { user: toUser(user) };
  },

  signIn: async (_parent, { input }, context) => {
    const user = await getUserByEmail(context.pool, input.email);
    if (!user) {
      throw new GraphQLError('Invalid email or password', { extensions: { code: 'BAD_REQUEST' } });
    }

    const isValid = await verifyPassword(input.password, user.password_hash);
    if (!isValid) {
      throw new GraphQLError('Invalid email or password', { extensions: { code: 'BAD_REQUEST' } });
    }

    (context.req.session as any).user = { id: user.id, email: user.email };

    return { user: toUser(user) };
  },

  signOut: (_parent, _args, context) => {
    requireAuth(context);
    return new Promise<boolean>((resolve, reject) => {
      context.req.session.destroy((err: unknown) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
  },
};

export const authResolvers = { Query, Mutation };
