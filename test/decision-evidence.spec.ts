import { describe, expect, it } from 'vitest';

import { fingerprintDecisionDeviceSignals } from '../shared/domain/decision-evidence';
import type { DecisionDeviceSignals } from '../shared/domain/loan-application';

const signals: DecisionDeviceSignals = {
  userAgent: 'LendDocket test browser',
  platform: 'TestOS',
  vendor: 'Test vendor',
  languages: ['en-GH'],
  timeZone: 'Africa/Accra',
  screen: {
    width: 1440,
    height: 900,
    availableWidth: 1440,
    availableHeight: 860,
    colorDepth: 24,
    pixelRatio: 1,
  },
  hardwareConcurrency: 8,
  deviceMemoryGiB: 8,
  maxTouchPoints: 0,
  cookieEnabled: true,
  geolocation: {
    latitude: 6.6885,
    longitude: -1.6244,
    accuracyMeters: 12,
    altitudeMeters: null,
    altitudeAccuracyMeters: null,
    headingDegrees: null,
    speedMetersPerSecond: null,
    capturedAt: '2026-11-08T12:00:00.000Z',
  },
};

describe('decision device evidence', () => {
  it('produces a stable SHA-256 fingerprint from browser and geolocation signals', async () => {
    const first = await fingerprintDecisionDeviceSignals(signals);
    const second = await fingerprintDecisionDeviceSignals(signals);

    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(second).toBe(first);
  });

  it('changes the fingerprint when the decision location changes', async () => {
    const first = await fingerprintDecisionDeviceSignals(signals);
    const relocated = await fingerprintDecisionDeviceSignals({
      ...signals,
      geolocation: {
        ...signals.geolocation,
        latitude: 5.6037,
        longitude: -0.187,
      },
    });

    expect(relocated).not.toBe(first);
  });
});
