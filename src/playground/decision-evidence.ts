import type {
  DecisionDeviceEvidence,
  DecisionDeviceSignals,
} from '../../shared/domain/loan-application';
import { fingerprintDecisionDeviceSignals } from '../../shared/domain/decision-evidence';

type NavigatorWithDeviceMemory = Navigator & {
  deviceMemory?: number;
};

function readRequiredGeolocation(): Promise<DecisionDeviceSignals['geolocation']> {
  if (!navigator.geolocation) {
    return Promise.reject(new Error('Geolocation is required to record a lending decision.'));
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: position.coords.accuracy,
          altitudeMeters: position.coords.altitude,
          altitudeAccuracyMeters: position.coords.altitudeAccuracy,
          headingDegrees: position.coords.heading,
          speedMetersPerSecond: position.coords.speed,
          capturedAt: new Date(position.timestamp).toISOString(),
        });
      },
      (error) => {
        const detail =
          error.code === error.PERMISSION_DENIED
            ? 'Location permission was denied.'
            : error.code === error.POSITION_UNAVAILABLE
              ? 'The device location is unavailable.'
              : 'The location request timed out.';
        reject(new Error(`${detail} A verified location is required to record the decision.`));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15_000,
      },
    );
  });
}

export async function captureDecisionDeviceEvidence(): Promise<DecisionDeviceEvidence> {
  const geolocation = await readRequiredGeolocation();
  const navigatorWithMemory = navigator as NavigatorWithDeviceMemory;
  const signals: DecisionDeviceSignals = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    vendor: navigator.vendor,
    languages: [...navigator.languages],
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      availableWidth: window.screen.availWidth,
      availableHeight: window.screen.availHeight,
      colorDepth: window.screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
    },
    hardwareConcurrency: navigator.hardwareConcurrency || null,
    deviceMemoryGiB: navigatorWithMemory.deviceMemory ?? null,
    maxTouchPoints: navigator.maxTouchPoints,
    cookieEnabled: navigator.cookieEnabled,
    geolocation,
  };

  return {
    fingerprint: {
      value: await fingerprintDecisionDeviceSignals(signals),
      algorithm: 'SHA-256',
      source: 'browser-signals-geolocation-v1',
    },
    signals,
    capturedAt: new Date().toISOString(),
  };
}
