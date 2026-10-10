/**
 * Creates the test database if it does not exist yet — the equivalent of
 * Rails' `db:test:prepare` create step. Migrating it is a separate npm script,
 * because node-pg-migrate can already point at TEST_DATABASE_URL itself.
 *
 * Run via: npm run db:test:prepare -w server
 */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { Client } from 'pg';

const currentFile = fileURLToPath(import.meta.url);
const repoRoot = dirname(dirname(dirname(currentFile)));
dotenv.config({ path: join(repoRoot, '.env') });

const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl) {
  console.error(
    'TEST_DATABASE_URL is not set. Copy the line from .env.example into your .env.'
  );
  process.exit(1);
}

const parsed = new URL(testUrl);
const databaseName = parsed.pathname.replace(/^\//, '');

if (!databaseName) {
  console.error(`TEST_DATABASE_URL has no database name: ${testUrl}`);
  process.exit(1);
}

if (!/_test$/.test(databaseName)) {
  // Cheap guard against pointing this at the dev database by accident, since
  // the whole point is that tests never touch real data.
  console.error(
    `Refusing to proceed: TEST_DATABASE_URL database "${databaseName}" does not end in "_test".`
  );
  process.exit(1);
}

// CREATE DATABASE cannot run inside a transaction or from within the database
// being created, so connect to the maintenance database instead.
const adminUrl = new URL(testUrl);
adminUrl.pathname = '/postgres';

const client = new Client({ connectionString: adminUrl.toString() });

try {
  await client.connect();

  const existing = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
    databaseName,
  ]);

  if (existing.rowCount && existing.rowCount > 0) {
    console.log(`Test database "${databaseName}" already exists.`);
  } else {
    // Identifiers cannot be parameterised; the _test suffix check above plus
    // quoting keeps this safe.
    await client.query(`CREATE DATABASE "${databaseName.replace(/"/g, '""')}"`);
    console.log(`Created test database "${databaseName}".`);
  }
} catch (error) {
  console.error('Failed to prepare the test database:', error);
  process.exit(1);
} finally {
  await client.end();
}
