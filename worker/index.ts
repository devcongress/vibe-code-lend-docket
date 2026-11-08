import { app } from './app';
import { handleJobBatch } from './jobs';

export default {
  fetch: app.fetch,
  queue: handleJobBatch,
} satisfies ExportedHandler<CloudflareBindings>;
