import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { installDateTypeParsers } from './src/db/typeParsers.js';

// Mirrors the env loading in src/index.ts: the .env lives at the repo root,
// one level above this workspace. Without this, DATABASE_URL is undefined and
// pg fails with "client password must be a string".
const currentFile = fileURLToPath(import.meta.url);
const repoRoot = dirname(dirname(currentFile));
dotenv.config({ path: join(repoRoot, '.env') });

// Tests build their own Pool rather than going through createPool(), so register
// the parsers here too — they are global to the pg module.
installDateTypeParsers();
