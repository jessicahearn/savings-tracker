import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 4000;
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.json());

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

const typeDefs = readFileSync(join(__dirname, 'graphql', 'schema.graphql'), 'utf8');

const resolvers = {
  Query: {
    hello: () => 'Hello World',
  },
};

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use('/graphql', expressMiddleware(server));

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
}

startServer().catch(console.error);
