import { GraphQLError } from 'graphql';
import { requireAuth } from '../requireAuth.js';
import { assertDeletable } from '../assertDeletable.js';
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
  getScenarioEventCountForPerson,
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

    // Three tables reference people, all ON DELETE RESTRICT: transactions,
    // account_people and scenario_events. Each needs counting here, or the
    // DELETE reaches Postgres and raises a raw foreign-key violation.
    const [transactionCount, accountCount, scenarioEventCount] = await Promise.all([
      getTransactionCountForPerson(context.pool, personId),
      getAccountCountForPerson(context.pool, personId),
      getScenarioEventCountForPerson(context.pool, personId),
    ]);

    assertDeletable('person', [
      { count: transactionCount, noun: 'transaction' },
      { count: accountCount, noun: 'account' },
      { count: scenarioEventCount, noun: 'scenario event' },
    ]);

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
