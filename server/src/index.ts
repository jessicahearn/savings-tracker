import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = dirname(dirname(dirname(currentFile)));
dotenv.config({ path: join(projectRoot, '.env') });

import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { readFileSync } from 'fs';

import { createPool } from './db/pool.js';
import { createSessionMiddleware } from './auth/session.js';
import { createContext } from './context.js';
import { resolvers } from './graphql/resolvers/index.js';

const app = express();
const PORT = process.env.PORT || 4000;
const __dirname = dirname(currentFile);

const typeDefs = readFileSync(join(__dirname, 'graphql', 'schema.graphql'), 'utf8');

async function startServer() {
  const pool = createPool();

  app.use(express.json());
  app.use(createSessionMiddleware(pool));

  app.get('/healthz', (req, res) => {
    res.json({ status: 'ok' });
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => createContext(req, pool),
    })
  );

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
}

startServer().catch(console.error);
