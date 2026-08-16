import { GraphQLError } from 'graphql';
import { requireAuth } from '../requireAuth.js';
import { toPerson } from '../mappers.js';
import type { QueryResolvers, MutationResolvers } from '../generated.js';
import {
  getAllPeople,
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson,
  getTransactionCountForPerson,
  getAccountCountForPerson,
} from '../../db/repositories/peopleRepo.js';

function notFound(): never {
  throw new GraphQLError('Person not found', { extensions: { code: 'NOT_FOUND' } });
}

const Query: Pick<QueryResolvers, 'people'> = {
  people: async (_parent, _args, context) => {
    requireAuth(context);
    const people = await getAllPeople(context.pool);
    return people.map(toPerson);
  },
};

const Mutation: Pick<MutationResolvers, 'createPerson' | 'updatePerson' | 'deletePerson'> = {
  createPerson: async (_parent, { input }, context) => {
    requireAuth(context);
    return toPerson(await createPerson(context.pool, input.name));
  },

  updatePerson: async (_parent, { id, input }, context) => {
    requireAuth(context);
    const personId = parseInt(id, 10);

    const person = await getPersonById(context.pool, personId);
    if (!person) notFound();

    const updated = await updatePerson(context.pool, personId, input.name || person.name);
    if (!updated) {
      throw new GraphQLError('Failed to update person', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
    return toPerson(updated);
  },

  deletePerson: async (_parent, { id }, context) => {
    requireAuth(context);
    const personId = parseInt(id, 10);

    const person = await getPersonById(context.pool, personId);
    if (!person) notFound();

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
        `Cannot delete person — still linked to ${blockers.join(' and ')}. Remove those first.`,
        { extensions: { code: 'CONFLICT' } }
      );
    }

    const deleted = await deletePerson(context.pool, personId);
    if (!deleted) {
      throw new GraphQLError('Failed to delete person', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
    return true;
  },
};

export const peopleResolvers = { Query, Mutation };
