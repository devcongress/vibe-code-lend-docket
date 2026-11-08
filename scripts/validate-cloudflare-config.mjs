import { readFile } from 'node:fs/promises';

const target = process.argv[2];
const allowedTargets = new Set(['staging', 'production']);

if (!target || !allowedTargets.has(target)) {
  throw new Error('Expected one target: staging or production.');
}

const rawConfig = await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8');
const strictJson = rawConfig.replace(/,\s*([}\]])/g, '$1');
const config = JSON.parse(strictJson);
const environment = config.env?.[target];

if (!environment) {
  throw new Error(`Missing Cloudflare environment: ${target}.`);
}

const placeholderIds = new Set([
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
]);
const databaseId = environment.d1_databases?.[0]?.database_id;

if (!databaseId || placeholderIds.has(databaseId)) {
  throw new Error(`Replace the ${target} D1 placeholder with the provisioned database ID.`);
}

for (const binding of ['DB', 'FILES', 'JOBS']) {
  const serialized = JSON.stringify(environment);
  if (!serialized.includes(`"${binding}"`)) {
    throw new Error(`The ${target} environment is missing its ${binding} binding.`);
  }
}

if (environment.vars?.APP_ENV !== target) {
  throw new Error(`The ${target} APP_ENV value must be ${target}.`);
}

console.warn(`Cloudflare ${target} configuration is ready for deployment.`);
