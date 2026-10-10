import { GraphQLError } from 'graphql';
import { requireAuth } from '../requireAuth.js';
import {
  toAccount,
  toCategory,
  toPerson,
  toScenario,
  toScenarioEvent,
  toScenarioGrid,
  toTransactionFilter,
} from '../mappers.js';
import type {
  QueryResolvers,
  MutationResolvers,
  ScenarioResolvers,
} from '../generated.js';
import {
  getScenariosByAccount,
  getScenarioById,
  createScenario,
  updateScenario,
  deleteScenario,
  getEventsByScenario,
  getScenarioEventById,
  createScenarioEvent,
  updateScenarioEvent,
  deleteScenarioEvent,
  type UpdateScenarioEventData,
} from '../../db/repositories/scenariosRepo.js';
import { getBalancesByPersonCategory } from '../../db/repositories/transactionsRepo.js';
import { getAccountById } from '../../db/repositories/accountsRepo.js';
import { getAllPeople } from '../../db/repositories/peopleRepo.js';
import { getAllCategories } from '../../db/repositories/categoriesRepo.js';
import { buildScenarioGrid } from '../../lib/scenarioGrid.js';

function scenarioNotFound(): never {
  throw new GraphQLError('Scenario not found', { extensions: { code: 'NOT_FOUND' } });
}

function eventNotFound(): never {
  throw new GraphQLError('Scenario event not found', { extensions: { code: 'NOT_FOUND' } });
}

const Query: Pick<QueryResolvers, 'scenario' | 'scenarios'> = {
  scenario: async (_parent, { id }, context) => {
    requireAuth(context);
    const scenario = await getScenarioById(context.pool, parseInt(id, 10));
    if (!scenario) scenarioNotFound();
    return toScenario(scenario);
  },

  scenarios: async (_parent, { accountId }, context) => {
    requireAuth(context);
    const scenarios = await getScenariosByAccount(context.pool, parseInt(accountId, 10));
    return scenarios.map(toScenario);
  },
};

const Mutation: Pick<
  MutationResolvers,
  | 'createScenario'
  | 'updateScenario'
  | 'deleteScenario'
  | 'createScenarioEvent'
  | 'updateScenarioEvent'
  | 'deleteScenarioEvent'
> = {
  createScenario: async (_parent, { input }, context) => {
    requireAuth(context);

    const accountId = parseInt(input.accountId, 10);
    const account = await getAccountById(context.pool, accountId);
    if (!account) {
      throw new GraphQLError('Account not found', { extensions: { code: 'NOT_FOUND' } });
    }

    return toScenario(
      await createScenario(context.pool, {
        accountId,
        name: input.name,
        startDate: input.startDate,
        endDate: input.endDate,
      })
    );
  },

  updateScenario: async (_parent, { id, input }, context) => {
    requireAuth(context);

    const scenario = await updateScenario(context.pool, parseInt(id, 10), {
      name: input.name ?? undefined,
      startDate: input.startDate ?? undefined,
      endDate: input.endDate ?? undefined,
    });
    if (!scenario) scenarioNotFound();
    return toScenario(scenario);
  },

  deleteScenario: async (_parent, { id }, context) => {
    requireAuth(context);

    const scenarioId = parseInt(id, 10);
    const scenario = await getScenarioById(context.pool, scenarioId);
    if (!scenario) scenarioNotFound();

    // Events go with it via ON DELETE CASCADE, so no guard is needed here —
    // unlike people and categories, nothing outside the scenario refers to them.
    return deleteScenario(context.pool, scenarioId);
  },

  createScenarioEvent: async (_parent, { input }, context) => {
    requireAuth(context);

    const scenarioId = parseInt(input.scenarioId, 10);
    const scenario = await getScenarioById(context.pool, scenarioId);
    if (!scenario) scenarioNotFound();

    const created = await createScenarioEvent(context.pool, {
      scenarioId,
      personId: parseInt(input.personId, 10),
      categoryId: parseInt(input.categoryId, 10),
      amount: input.amount,
      description: input.description ?? null,
      startDate: input.startDate,
      endDate: input.endDate ?? null,
      recurrenceInterval: input.recurrenceInterval ?? null,
      recurrenceUnit: input.recurrenceUnit ?? null,
    });

    // Read it back joined, so the response carries person and category.
    const events = await getEventsByScenario(context.pool, scenarioId);
    const event = events.find((e) => e.id === created.id);
    if (!event) eventNotFound();
    return toScenarioEvent(event);
  },

  updateScenarioEvent: async (_parent, { id, input }, context) => {
    requireAuth(context);

    const eventId = parseInt(id, 10);
    const existing = await getScenarioEventById(context.pool, eventId);
    if (!existing) eventNotFound();

    // An omitted field leaves the value alone; an explicit null clears it. Only
    // the genuinely nullable columns honour null — person, category, amount and
    // startDate are NOT NULL, so null there is treated as "not provided".
    const data: UpdateScenarioEventData = {};
    if (input.personId != null) data.personId = parseInt(input.personId, 10);
    if (input.categoryId != null) data.categoryId = parseInt(input.categoryId, 10);
    if (input.amount != null) data.amount = input.amount;
    if (input.startDate != null) data.startDate = input.startDate;
    if (input.description !== undefined) data.description = input.description;
    if (input.endDate !== undefined) data.endDate = input.endDate;
    if (input.recurrenceInterval !== undefined) {
      data.recurrenceInterval = input.recurrenceInterval;
    }
    if (input.recurrenceUnit !== undefined) data.recurrenceUnit = input.recurrenceUnit;

    const updated = await updateScenarioEvent(context.pool, eventId, data);
    if (!updated) eventNotFound();

    const events = await getEventsByScenario(context.pool, updated.scenario_id);
    const event = events.find((e) => e.id === updated.id);
    if (!event) eventNotFound();
    return toScenarioEvent(event);
  },

  deleteScenarioEvent: async (_parent, { id }, context) => {
    requireAuth(context);

    const eventId = parseInt(id, 10);
    const existing = await getScenarioEventById(context.pool, eventId);
    if (!existing) eventNotFound();

    return deleteScenarioEvent(context.pool, eventId);
  },
};

const Scenario: ScenarioResolvers = {
  account: async (parent, _args, context) => {
    const account = await getAccountById(context.pool, parent.accountId);
    if (!account) {
      throw new GraphQLError('Account not found', { extensions: { code: 'NOT_FOUND' } });
    }
    return toAccount(account);
  },

  events: async (parent, _args, context) => {
    const events = await getEventsByScenario(context.pool, parent.id);
    return events.map(toScenarioEvent);
  },

  /**
   * A field resolver so listing scenarios does not compute anybody's grid.
   *
   * Both grids are built over one shared pair of axes, assembled here from:
   *  - the account's members, so a person with nothing yet still shows a zero row
   *  - anyone appearing in the baseline balances or in an event, which covers a
   *    person since removed from the account but still owning history
   *  - anything the filter names explicitly, so selecting an empty category
   *    shows an empty column rather than silently dropping it
   *
   * Narrowing all-people and all-categories by that id set also inherits their
   * alphabetical ordering for free.
   */
  grid: async (parent, { filter }, context) => {
    const repoFilter = toTransactionFilter(filter);

    const [account, allPeople, allCategories, balances, events] = await Promise.all([
      getAccountById(context.pool, parent.accountId),
      getAllPeople(context.pool),
      getAllCategories(context.pool),
      getBalancesByPersonCategory(
        context.pool,
        parent.accountId,
        parent.startDate,
        repoFilter
      ),
      getEventsByScenario(context.pool, parent.id),
    ]);

    if (!account) {
      throw new GraphQLError('Account not found', { extensions: { code: 'NOT_FOUND' } });
    }

    const personIds = new Set<number>(account.people.map((p) => p.id));
    const categoryIds = new Set<number>();

    for (const balance of balances) {
      personIds.add(balance.person_id);
      categoryIds.add(balance.category_id);
    }
    for (const event of events) {
      personIds.add(event.person_id);
      categoryIds.add(event.category_id);
    }
    for (const id of repoFilter?.personIds ?? []) personIds.add(id);
    for (const id of repoFilter?.categoryIds ?? []) categoryIds.add(id);

    const people = allPeople.filter((p) => personIds.has(p.id)).map(toPerson);
    const categories = allCategories.filter((c) => categoryIds.has(c.id)).map(toCategory);

    const grid = buildScenarioGrid({
      window: { startDate: parent.startDate, endDate: parent.endDate },
      balances: balances.map((b) => ({
        personId: b.person_id,
        categoryId: b.category_id,
        amount: b.amount,
      })),
      events: events.map((e) => ({
        personId: e.person_id,
        categoryId: e.category_id,
        amount: parseFloat(e.amount),
        startDate: e.start_date,
        endDate: e.end_date,
        recurrenceInterval: e.recurrence_interval,
        recurrenceUnit: e.recurrence_unit,
      })),
      people,
      categories,
      filter: repoFilter,
    });

    return toScenarioGrid(grid, people, categories);
  },
};

export const scenariosResolvers = { Query, Mutation, Scenario };
