import { GraphQLError } from 'graphql';
import { requireAuth } from '../requireAuth.js';
import { toCategory } from '../mappers.js';
import type { QueryResolvers, MutationResolvers } from '../generated.js';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getTransactionCountForCategory,
} from '../../db/repositories/categoriesRepo.js';

function notFound(): never {
  throw new GraphQLError('Category not found', { extensions: { code: 'NOT_FOUND' } });
}

const Query: Pick<QueryResolvers, 'transactionCategories'> = {
  transactionCategories: async (_parent, _args, context) => {
    requireAuth(context);
    const categories = await getAllCategories(context.pool);
    return categories.map(toCategory);
  },
};

const Mutation: Pick<
  MutationResolvers,
  'createTransactionCategory' | 'updateTransactionCategory' | 'deleteTransactionCategory'
> = {
  createTransactionCategory: async (_parent, { input }, context) => {
    requireAuth(context);
    return toCategory(await createCategory(context.pool, input.name));
  },

  updateTransactionCategory: async (_parent, { id, input }, context) => {
    requireAuth(context);
    const categoryId = parseInt(id, 10);

    const category = await getCategoryById(context.pool, categoryId);
    if (!category) notFound();

    const updated = await updateCategory(context.pool, categoryId, input.name || category.name);
    if (!updated) {
      throw new GraphQLError('Failed to update category', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
    return toCategory(updated);
  },

  deleteTransactionCategory: async (_parent, { id }, context) => {
    requireAuth(context);
    const categoryId = parseInt(id, 10);

    const category = await getCategoryById(context.pool, categoryId);
    if (!category) notFound();

    // transactions.category_id is ON DELETE RESTRICT. Categories are not
    // referenced by any other table, so transactions are the only blocker.
    const transactionCount = await getTransactionCountForCategory(context.pool, categoryId);
    if (transactionCount > 0) {
      throw new GraphQLError(
        `Cannot delete category — still has ${transactionCount} transaction(s). Remove those first.`,
        { extensions: { code: 'CONFLICT' } }
      );
    }

    const deleted = await deleteCategory(context.pool, categoryId);
    if (!deleted) {
      throw new GraphQLError('Failed to delete category', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
    return true;
  },
};

export const categoriesResolvers = { Query, Mutation };
