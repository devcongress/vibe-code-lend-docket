# LendDocket

LendDocket is a Cloudflare-native record-keeping service for staff-assisted loan applications and independent lending decisions in Ghana. It does not disburse funds or collect repayments.

The governing documents are:

- [Charter](./CHARTER.md)
- [Restrictive product rules](./PRODUCT_RULES.md)
- [Delivery checklist](./TODO.md)

## Stack

- React, React Router, TanStack Query, Vite, and TypeScript.
- Cloudflare Workers with Hono.
- Local bindings for D1, R2, and Queues.
- Vitest in the Workers runtime and Playwright in Chromium.
- Oxlint and Oxfmt.

## Prerequisites

- Node.js 24.
- pnpm 12.18.0. The version is pinned in `package.json`.

If pnpm is not installed globally, prefix commands with `npx pnpm@12.18.0`, for example `npx pnpm@12.18.0 install`.

## Local development

```sh
pnpm install
pnpm cf:typegen
pnpm dev
```

Open the local URL printed by Vite. Vite runs both the React application and Worker locally, including local D1, R2, and Queue bindings.

## Playable workflow

The current build is a deliberately temporary, browser-local playground for validating the workflow before milestone 2 establishes durable storage.

**Shareable playground:** [lenddocket-playground.true-sense-inc.workers.dev](https://lenddocket-playground.true-sense-inc.workers.dev)

1. Start as the **Agent** persona.
2. Select **Start application**, then use **Fill sample details** or enter fictional information.
3. Complete the acknowledgement and submit the application.
4. Switch to the **Reviewer** persona.
5. Open the submitted record and approve or reject it with a decision note.

Demo records persist in that browser's local storage. The reset button restores the two seeded records. This is not production storage, authentication, or an identity-management substitute. Never enter real personal, identity, or financial data into the playground.

Useful checks:

```sh
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
pnpm check
pnpm deploy:dry-run
```

Playwright requires Chromium once per machine:

```sh
pnpm exec playwright install chromium
```

## Configuration

- `wrangler.jsonc` is the source of truth for Worker bindings.
- `wrangler.playground.jsonc` deliberately deploys the public demo without storage bindings.
- Local resources use the top-level configuration and remain under `.wrangler/`.
- Staging and production have separate Wrangler environments and Cloudflare resource names.
- `.dev.vars` and `.env` are ignored. Copy their example files only when local values are needed.
- Browser-visible variables must start with `VITE_`; secrets must never use that prefix.

The staging and production D1 IDs are deliberate placeholders. Before the first deployment, create the resources and replace only the matching environment values:

```sh
pnpm exec wrangler d1 create lenddocket-staging
pnpm exec wrangler r2 bucket create lenddocket-staging-files
pnpm exec wrangler queues create lenddocket-staging-jobs
pnpm config:validate staging
pnpm deploy:staging
```

Repeat with the production names only after staging has been accepted. `config:validate` refuses to deploy while a placeholder D1 ID remains.

## Project boundaries

- `src/`: browser application.
- `worker/`: Hono API and Queue handler.
- `worker/modules/`: product-domain boundaries.
- `shared/`: contracts safe to use in both browser and Worker code.
- `test/`: Workers-runtime tests.
- `e2e/`: browser tests.

Do not place personal data in logs, fixtures, screenshots, or committed environment files. Use fictional test records only.
