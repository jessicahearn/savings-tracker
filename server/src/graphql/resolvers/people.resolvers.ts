import { GraphQLError } from 'graphql';
import { GraphQLContext } from '../../context.js';
import {
  getAllPeople,
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson,
  getTransactionCountForPerson,
} from '../../db/repositories/peopleRepo.js';

function requireAuth(context: GraphQLContext) {
  if (!context.user) {
    throw new GraphQLError('Unauthenticated', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  return context.user;
}

export const peopleResolvers = {
  Query: {
    people: async (_: unknown, __: unknown, context: GraphQLContext) => {
      requireAuth(context);
      const people = await getAllPeople(context.pool);
      return people.map((p) => ({ id: p.id, name: p.name, createdAt: p.created_at }));
    },
  },
  Mutation: {
    createPerson: async (
      _: unknown,
      { input }: { input: { name: string } },
      context: GraphQLContext
    ) => {
      requireAuth(context);
      const person = await createPerson(context.pool, input.name);
      return { id: person.id, name: person.name, createdAt: person.created_at };
    },

    updatePerson: async (
      _: unknown,
      { id, input }: { id: string; input: { name?: string } },
      context: GraphQLContext
    ) => {
      requireAuth(context);
      const personId = parseInt(id, 10);
      const person = await getPersonById(context.pool, personId);
      if (!person) {
        throw new GraphQLError('Person not found', { extensions: { code: 'NOT_FOUND' } });
      }
      const updated = await updatePerson(context.pool, personId, input.name || person.name);
      if (!updated) {
        throw new GraphQLError('Failed to update person', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
      return { id: updated.id, name: updated.name, createdAt: updated.created_at };
    },

    deletePerson: async (
      _: unknown,
      { id }: { id: string },
      context: GraphQLContext
    ) => {
      requireAuth(context);
      const personId = parseInt(id, 10);
      const person = await getPersonById(context.pool, personId);
      if (!person) {
        throw new GraphQLError('Person not found', { extensions: { code: 'NOT_FOUND' } });
      }

      const transactionCount = await getTransactionCountForPerson(context.pool, personId);
      if (transactionCount > 0) {
        throw new GraphQLError(`Cannot delete person — still has ${transactionCount} transaction(s)`, {
          extensions: { code: 'CONFLICT' },
        });
      }

      const deleted = await deletePerson(context.pool, personId);
      if (!deleted) {
        throw new GraphQLError('Failed to delete person', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
      return true;
    },
  },
};
