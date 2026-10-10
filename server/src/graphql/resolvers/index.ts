import type { Resolvers } from '../generated.js';
import { authResolvers } from './auth.resolvers.js';
import { peopleResolvers } from './people.resolvers.js';
import { categoriesResolvers } from './categories.resolvers.js';
import { accountsResolvers } from './accounts.resolvers.js';
import { transactionsResolvers } from './transactions.resolvers.js';
import { usersResolvers } from './users.resolvers.js';

/**
 * Annotated with the generated `Resolvers` type, so the assembled map is checked
 * against schema.graphql. Each domain file contributes a `Pick<...>` of the
 * fields it owns; this is where they are merged and verified as a whole.
 *
 * Regenerate with `npm run codegen -w server` after editing schema.graphql —
 * `tsx watch` does not watch .graphql files, so the running dev server also
 * needs a restart to pick up schema changes.
 */
export const resolvers: Resolvers = {
  Query: {
    ...authResolvers.Query,
    ...peopleResolvers.Query,
    ...categoriesResolvers.Query,
    ...accountsResolvers.Query,
    ...usersResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...peopleResolvers.Mutation,
    ...categoriesResolvers.Mutation,
    ...accountsResolvers.Mutation,
    ...transactionsResolvers.Mutation,
  },
  Account: {
    ...transactionsResolvers.Account,
  },
  Transaction: {
    ...transactionsResolvers.Transaction,
  },
};
