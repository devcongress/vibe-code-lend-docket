import { z } from 'zod';

import { RuntimeEnvironmentSchema } from '../shared/contracts/health';

const WorkerConfigSchema = z.object({
  APP_ENV: RuntimeEnvironmentSchema,
});

export type WorkerConfig = z.infer<typeof WorkerConfigSchema>;

export function readWorkerConfig(bindings: CloudflareBindings): WorkerConfig {
  return WorkerConfigSchema.parse({ APP_ENV: bindings.APP_ENV });
}
