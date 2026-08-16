import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: '../server/src/graphql/schema.graphql',
  documents: ['src/graphql/**/*.graphql'],
  generates: {
    'src/graphql/generated.ts': {
      // NOTE: no 'typescript' plugin. As of codegen v6, 'typescript-operations'
      // emits input types itself, so including both produces duplicate
      // identifiers (TS2300). Operations + fragments + inputs is everything the
      // client consumes; the full schema object types are server-side concerns.
      plugins: ['typescript-operations', 'typescript-react-apollo'],
      config: { withHooks: true },
    },
  },
};

export default config;
