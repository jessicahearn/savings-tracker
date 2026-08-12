import { authResolvers } from './auth.resolvers.js';
import { peopleResolvers } from './people.resolvers.js';
import { categoriesResolvers } from './categories.resolvers.js';

export const resolvers = {
  Query: {
    hello: () => 'Hello World',
    ...authResolvers.Query,
    ...peopleResolvers.Query,
    ...categoriesResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...peopleResolvers.Mutation,
    ...categoriesResolvers.Mutation,
  },
};
