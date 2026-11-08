import type { CustomerRecord } from '../../shared/domain/customer';
import { DEMO_BRANCH, DEMO_LENDER } from '../../shared/domain/lender';
import { DEMO_AGENT_STAFF, DEMO_REVIEWER_STAFF } from '../../shared/domain/lender-staff';
import type {
  ApplicationActorRole,
  ApplicationScope,
  DecisionDeviceEvidence,
} from '../../shared/domain/loan-application';
import { DEMO_LOAN_PRODUCT } from '../../shared/domain/loan-product';
import { calculateLoanTerms, type LoanTerms } from '../../shared/domain/loan-terms';

export type DemoRole = ApplicationActorRole;

export type NewApplicationInput = {
  fullLegalName: string;
  dateOfBirth: string;
  mobileNumber: string;
  ghanaCardPin: string;
  verificationReference: string;
  verificationTimestamp: string;
  community: string;
  district: string;
  region: string;
  digitalAddress: string;
  occupation: string;
  primaryIncomeSource: string;
  monthlyNetIncomeGhs: number;
  preferredLanguage: string;
  principalGhs: number;
  acknowledged: boolean;
};

export const DEMO_AGENT = DEMO_AGENT_STAFF.profile.displayName;
export const DEMO_REVIEWER = DEMO_REVIEWER_STAFF.profile.displayName;
export const DEMO_APPLICATION_SCOPE: ApplicationScope = {
  lenderId: DEMO_LENDER.id,
  branchId: DEMO_BRANCH.id,
};

export const DEMO_DECISION_DEVICE_EVIDENCE: DecisionDeviceEvidence = {
  fingerprint: {
    value: '5d79cdc651f244dc9b2f659ab89ada1295f0a384f49f702980f26889dc34f2a8',
    algorithm: 'SHA-256',
    source: 'browser-signals-geolocation-v1',
  },
  signals: {
    userAgent: 'LendDocket fictional demo browser',
    platform: 'DemoOS',
    vendor: 'LendDocket',
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
      capturedAt: '2026-11-07T14:02:00.000Z',
    },
  },
  capturedAt: '2026-11-07T14:02:00.000Z',
};

export function createCustomerRecord(input: NewApplicationInput): CustomerRecord {
  return {
    identity: {
      fullLegalName: input.fullLegalName.trim(),
      dateOfBirth: input.dateOfBirth,
      document: {
        kind: 'ghana-card',
        lastFour: input.ghanaCardPin.replace(/\W/g, '').slice(-4),
      },
    },
    contact: {
      mobileNumber: input.mobileNumber.trim(),
      preferredSpokenLanguage: input.preferredLanguage,
    },
    address: {
      community: input.community.trim(),
      district: input.district.trim(),
      region: input.region.trim(),
      digitalAddress: input.digitalAddress.trim().toUpperCase(),
    },
    livelihood: {
      occupation: input.occupation.trim(),
      primaryIncomeSource: input.primaryIncomeSource.trim(),
      monthlyNetIncomePesewas: Math.round(input.monthlyNetIncomeGhs * 100),
    },
    verification: {
      kind: 'external-biometric',
      reference: input.verificationReference.trim(),
      completedAt: input.verificationTimestamp,
    },
  };
}

export function calculateTerms(principalGhs: number, product = DEMO_LOAN_PRODUCT): LoanTerms {
  const principalPesewas = Math.round(principalGhs * 100);
  return calculateLoanTerms(principalPesewas, product);
}

export function formatGhs(pesewas: number) {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
  }).format(pesewas / 100);
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-GH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function customerInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}
