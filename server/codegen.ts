import type { CodegenConfig } from '@graphql-codegen/cli';

const models = './models.js';

const config: CodegenConfig = {
  schema: 'src/graphql/schema.graphql',
  generates: {
    'src/graphql/generated.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        // Resolvers receive our context, so `context.pool` / `context.user` are typed.
        contextType: '../context.js#GraphQLContext',

        // Point each schema type at the shape resolvers really pass around.
        // Without this, codegen assumes a resolver returns the full schema type
        // — so Query.accounts would be required to include `transactions` and
        // `totals`, which are supplied later by separate field resolvers.
        mappers: {
          Account: `${models}#AccountModel`,
          Person: `${models}#PersonModel`,
          TransactionCategory: `${models}#CategoryModel`,
          Transaction: `${models}#TransactionModel`,
          AccountTotals: `${models}#AccountTotalsModel`,
          User: `${models}#UserModel`,
          AuthPayload: `${models}#AuthPayloadModel`,
        },

        // Apollo Server 4 passes a resolver map that may carry extra keys.
        useIndexSignature: true,
      },
    },
  },
};

export default config;
