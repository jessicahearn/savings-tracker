import { GraphQLError } from 'graphql';
import { GraphQLContext } from '../../context.js';
import { hashPassword, verifyPassword } from '../../auth/password.js';
import { getUserByEmail, getUserById, createUser } from '../../db/repositories/usersRepo.js';

function requireAuth(context: GraphQLContext) {
  if (!context.user) {
    throw new GraphQLError('Unauthenticated', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  return context.user;
}

export const authResolvers = {
  Query: {
    me: (_: unknown, __: unknown, context: GraphQLContext) => {
      if (!context.user) return null;
      return {
        id: context.user.id,
        email: context.user.email,
        createdAt: new Date().toISOString(),
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

      (context as any).req.session.user = {
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

      (context as any).req.session.user = {
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
      const user = requireAuth(context);
      return new Promise<boolean>((resolve, reject) => {
        (context as any).req.session.destroy((err: any) => {
          if (err) reject(err);
          else resolve(true);
        });
      });
    },
  },
};
