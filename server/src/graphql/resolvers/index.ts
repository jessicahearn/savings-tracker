import { authResolvers } from './auth.resolvers.js';

export const resolvers = {
  Query: {
    hello: () => 'Hello World',
    ...authResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
  },
};
