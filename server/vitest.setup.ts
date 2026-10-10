import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { installDateTypeParsers } from './src/db/typeParsers.js';

// Mirrors the env loading in src/index.ts: the .env lives at the repo root,
// one level above this workspace. Without this, TEST_DATABASE_URL is undefined
// and pg fails with "client password must be a string".
const currentFile = fileURLToPath(import.meta.url);
const repoRoot = dirname(dirname(currentFile));
dotenv.config({ path: join(repoRoot, '.env') });

// Integration tests connect via TEST_DATABASE_URL only — see
// src/db/__tests__/support/testDb.ts. Failing here with instructions beats
// failing later with a connection error.
if (!process.env.TEST_DATABASE_URL) {
  throw new Error(
    'TEST_DATABASE_URL is not set.\n' +
      '  1. Copy the TEST_DATABASE_URL line from .env.example into your .env\n' +
      '  2. Run: npm run db:test:prepare -w server'
  );
}

// Tests build their own Pool rather than going through createPool(), so register
// the parsers here too — they are global to the pg module.
installDateTypeParsers();
