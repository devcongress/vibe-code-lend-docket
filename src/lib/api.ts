import { HealthResponseSchema, type HealthResponse } from '../../shared/contracts/health';

const apiBasePath = import.meta.env.VITE_API_BASE_PATH ?? '/api';

export async function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const response = await fetch(`${apiBasePath}/health`, signal ? { signal } : undefined);

  if (!response.ok) {
    throw new Error(`Health request failed with status ${response.status}.`);
  }

  return HealthResponseSchema.parse(await response.json());
}
