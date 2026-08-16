import { GraphQLError } from 'graphql';
import { GraphQLContext } from '../context.js';

/**
 * Guards a resolver behind an authenticated session. Every resolver except
 * signup/signIn calls this first.
 */
export function requireAuth(context: GraphQLContext) {
  if (!context.user) {
    throw new GraphQLError('Unauthenticated', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  return context.user;
}
