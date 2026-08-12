import { GraphQLError } from 'graphql';
import { GraphQLContext } from '../../context.js';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getTransactionCountForCategory,
} from '../../db/repositories/categoriesRepo.js';

function requireAuth(context: GraphQLContext) {
  if (!context.user) {
    throw new GraphQLError('Unauthenticated', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  return context.user;
}

export const categoriesResolvers = {
  Query: {
    transactionCategories: async (_: unknown, __: unknown, context: GraphQLContext) => {
      requireAuth(context);
      return getAllCategories(context.pool);
    },
  },
  Mutation: {
    createTransactionCategory: async (
      _: unknown,
      { input }: { input: { name: string } },
      context: GraphQLContext
    ) => {
      requireAuth(context);
      return createCategory(context.pool, input.name);
    },

    updateTransactionCategory: async (
      _: unknown,
      { id, input }: { id: string; input: { name?: string } },
      context: GraphQLContext
    ) => {
      requireAuth(context);
      const categoryId = parseInt(id, 10);
      const category = await getCategoryById(context.pool, categoryId);
      if (!category) {
        throw new GraphQLError('Category not found', { extensions: { code: 'NOT_FOUND' } });
      }
      return updateCategory(context.pool, categoryId, input.name || category.name);
    },

    deleteTransactionCategory: async (
      _: unknown,
      { id }: { id: string },
      context: GraphQLContext
    ) => {
      requireAuth(context);
      const categoryId = parseInt(id, 10);
      const category = await getCategoryById(context.pool, categoryId);
      if (!category) {
        throw new GraphQLError('Category not found', { extensions: { code: 'NOT_FOUND' } });
      }

      const transactionCount = await getTransactionCountForCategory(context.pool, categoryId);
      if (transactionCount > 0) {
        throw new GraphQLError(`Cannot delete category — still has ${transactionCount} transaction(s)`, {
          extensions: { code: 'CONFLICT' },
        });
      }

      const deleted = await deleteCategory(context.pool, categoryId);
      if (!deleted) {
        throw new GraphQLError('Failed to delete category', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
      return true;
    },
  },
};
