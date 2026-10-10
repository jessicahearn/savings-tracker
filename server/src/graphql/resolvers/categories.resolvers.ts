import { GraphQLError } from 'graphql';
import { requireAuth } from '../requireAuth.js';
import { assertDeletable } from '../assertDeletable.js';
import { toCategory } from '../mappers.js';
import type { QueryResolvers, MutationResolvers } from '../generated.js';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getTransactionCountForCategory,
  getScenarioEventCountForCategory,
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

    // Two tables reference categories, both ON DELETE RESTRICT: transactions
    // and scenario_events.
    const [transactionCount, scenarioEventCount] = await Promise.all([
      getTransactionCountForCategory(context.pool, categoryId),
      getScenarioEventCountForCategory(context.pool, categoryId),
    ]);

    assertDeletable('category', [
      { count: transactionCount, noun: 'transaction' },
      { count: scenarioEventCount, noun: 'scenario event' },
    ]);

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
