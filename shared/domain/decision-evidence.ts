import type { DecisionDeviceSignals } from './loan-application';

export async function fingerprintDecisionDeviceSignals(
  signals: DecisionDeviceSignals,
): Promise<string> {
  const payload = new TextEncoder().encode(JSON.stringify(signals));
  const digest = await crypto.subtle.digest('SHA-256', payload);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
