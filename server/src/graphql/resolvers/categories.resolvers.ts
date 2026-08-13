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
      const categories = await getAllCategories(context.pool);
      return categories.map((c) => ({ id: c.id, name: c.name, createdAt: c.created_at }));
    },
  },
  Mutation: {
    createTransactionCategory: async (
      _: unknown,
      { input }: { input: { name: string } },
      context: GraphQLContext
    ) => {
      requireAuth(context);
      const category = await createCategory(context.pool, input.name);
      return { id: category.id, name: category.name, createdAt: category.created_at };
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
      const updated = await updateCategory(context.pool, categoryId, input.name || category.name);
      if (!updated) {
        throw new GraphQLError('Failed to update category', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
      return { id: updated.id, name: updated.name, createdAt: updated.created_at };
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
