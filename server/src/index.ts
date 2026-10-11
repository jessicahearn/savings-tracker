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

  if (process.env.NODE_ENV === 'production') {
    // Caddy terminates TLS and forwards plain HTTP. Without this Express treats
    // the request as insecure and silently declines to send the session cookie,
    // which has `secure: true` in production — sign-in appears to succeed and
    // then every subsequent request is unauthenticated.
    app.set('trust proxy', 1);
  }

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

  if (process.env.NODE_ENV === 'production') {
    // Serving the built client from the API keeps the browser same-origin,
    // which is what lets apolloClient.ts use a relative '/graphql' and lets the
    // session cookie work with sameSite: 'lax'. A split origin would need CORS
    // and sameSite: 'none'.
    const clientDist = join(projectRoot, 'client', 'dist');
    app.use(express.static(clientDist));

    // Registered after /graphql, or it would swallow the API. Every unmatched
    // path returns index.html so client-side routes survive a page reload.
    app.get('*', (_req, res) => {
      res.sendFile(join(clientDist, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
}

startServer().catch(console.error);
