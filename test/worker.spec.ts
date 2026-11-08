import { env } from 'cloudflare:workers';
import { createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';

import { HealthResponseSchema } from '../shared/contracts/health';
import worker from '../worker';

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('LendDocket Worker', () => {
  it('returns a typed health response', async () => {
    const request = new IncomingRequest('http://example.com/api/health');
    const context = createExecutionContext();
    const response = await worker.fetch(request, env, context);
    await waitOnExecutionContext(context);

    expect(response.status).toBe(200);
    expect(HealthResponseSchema.parse(await response.json())).toEqual({
      status: 'ok',
      service: 'lenddocket',
      environment: 'local',
    });
  });

  it('provides local Cloudflare storage and queue bindings', () => {
    expect(env.DB).toBeDefined();
    expect(env.FILES).toBeDefined();
    expect(env.JOBS).toBeDefined();
  });

  it('returns JSON for missing API routes', async () => {
    const request = new IncomingRequest('http://example.com/api/missing');
    const context = createExecutionContext();
    const response = await worker.fetch(request, env, context);
    await waitOnExecutionContext(context);

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'not_found' });
  });
});
