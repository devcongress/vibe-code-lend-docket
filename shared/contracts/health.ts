import { z } from 'zod';

export const RuntimeEnvironmentSchema = z.enum(['local', 'staging', 'production']);

export const HealthResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.literal('lenddocket'),
  environment: RuntimeEnvironmentSchema,
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
