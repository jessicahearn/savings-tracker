// tsc only emits JavaScript, so schema.graphql — which src/index.ts reads from
// disk at startup — never reaches dist/ on its own. Without this the compiled
// server throws ENOENT on boot, which dev never reveals because tsx runs
// straight off src/.
import { copyFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const serverRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const from = join(serverRoot, 'src', 'graphql', 'schema.graphql');
const to = join(serverRoot, 'dist', 'graphql', 'schema.graphql');

mkdirSync(dirname(to), { recursive: true });
copyFileSync(from, to);
console.log(`copied ${from} -> ${to}`);
