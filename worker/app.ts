import { Hono } from 'hono';
import { requestId } from 'hono/request-id';
import { secureHeaders } from 'hono/secure-headers';

import type { HealthResponse } from '../shared/contracts/health';
import { readWorkerConfig } from './config';

type AppEnvironment = {
  Bindings: CloudflareBindings;
  Variables: {
    requestId: string;
  };
};

export const app = new Hono<AppEnvironment>();

app.use('*', requestId());
app.use('*', secureHeaders());

app.get('/api/health', (context) => {
  const config = readWorkerConfig(context.env);
  const response: HealthResponse = {
    status: 'ok',
    service: 'lenddocket',
    environment: config.APP_ENV,
  };

  return context.json(response);
});

app.notFound((context) => context.json({ error: 'not_found' }, 404));

app.onError((error, context) => {
  console.error(
    JSON.stringify({
      event: 'request.failed',
      requestId: context.get('requestId'),
      error: error.name,
    }),
  );

  return context.json({ error: 'internal_error' }, 500);
});
