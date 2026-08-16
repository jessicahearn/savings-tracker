import { authResolvers } from './auth.resolvers.js';
import { peopleResolvers } from './people.resolvers.js';
import { categoriesResolvers } from './categories.resolvers.js';
import { accountsResolvers } from './accounts.resolvers.js';
import { transactionsResolvers } from './transactions.resolvers.js';

export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...peopleResolvers.Query,
    ...categoriesResolvers.Query,
    ...accountsResolvers.Query,
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
