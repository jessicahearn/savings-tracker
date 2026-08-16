import { GraphQLError } from 'graphql';
import { GraphQLContext } from '../../context.js';
import { requireAuth } from '../requireAuth.js';
import {
  getAllPeople,
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson,
  getTransactionCountForPerson,
  getAccountCountForPerson,
} from '../../db/repositories/peopleRepo.js';

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

      // Both transactions.person_id and account_people.person_id are ON DELETE
      // RESTRICT. Check both so the user gets a readable reason rather than a
      // raw Postgres foreign-key violation.
      const [transactionCount, accountCount] = await Promise.all([
        getTransactionCountForPerson(context.pool, personId),
        getAccountCountForPerson(context.pool, personId),
      ]);

      const blockers: string[] = [];
      if (transactionCount > 0) blockers.push(`${transactionCount} transaction(s)`);
      if (accountCount > 0) blockers.push(`${accountCount} account(s)`);

      if (blockers.length > 0) {
        throw new GraphQLError(
          `Cannot delete person — still linked to ${blockers.join(' and ')}. ` +
            'Remove those first.',
          { extensions: { code: 'CONFLICT' } }
        );
      }

      const deleted = await deletePerson(context.pool, personId);
      if (!deleted) {
        throw new GraphQLError('Failed to delete person', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
      return true;
    },
  },
};
