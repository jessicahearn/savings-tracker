import { GraphQLError } from 'graphql';
import { GraphQLContext } from '../../context.js';
import { requireAuth } from '../requireAuth.js';
import { hashPassword, verifyPassword } from '../../auth/password.js';
import { getUserByEmail, getUserById, createUser } from '../../db/repositories/usersRepo.js';

export const authResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: GraphQLContext) => {
      if (!context.user) return null;

      // The session only carries { id, email }, so read the row for the real
      // createdAt. This also returns null for a session whose user has since
      // been deleted, which sends the client back to /login.
      const user = await getUserById(context.pool, context.user.id);
      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
      };
    },
  },
  Mutation: {
    signup: async (
      _: unknown,
      { input }: { input: { email: string; password: string } },
      context: GraphQLContext
    ) => {
      const existingUser = await getUserByEmail(context.pool, input.email);
      if (existingUser) {
        throw new GraphQLError('Email already in use', { extensions: { code: 'BAD_REQUEST' } });
      }

      const passwordHash = await hashPassword(input.password);
      const user = await createUser(context.pool, input.email, passwordHash);

      (context.req.session as any).user = {
        id: user.id,
        email: user.email,
      };

      return {
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.created_at,
        },
      };
    },

    signIn: async (
      _: unknown,
      { input }: { input: { email: string; password: string } },
      context: GraphQLContext
    ) => {
      const user = await getUserByEmail(context.pool, input.email);
      if (!user) {
        throw new GraphQLError('Invalid email or password', { extensions: { code: 'BAD_REQUEST' } });
      }

      const isValid = await verifyPassword(input.password, user.password_hash);
      if (!isValid) {
        throw new GraphQLError('Invalid email or password', { extensions: { code: 'BAD_REQUEST' } });
      }

      (context.req.session as any).user = {
        id: user.id,
        email: user.email,
      };

      return {
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.created_at,
        },
      };
    },

    signOut: (_: unknown, __: unknown, context: GraphQLContext) => {
      requireAuth(context);
      return new Promise<boolean>((resolve, reject) => {
        context.req.session.destroy((err: any) => {
          if (err) reject(err);
          else resolve(true);
        });
      });
    },
  },
};
