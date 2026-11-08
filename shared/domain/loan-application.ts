import type { CustomerRecord } from './customer';
import type { LenderScopeReference } from './lender';
import type { LenderStaffRole } from './lender-staff';
import type {
  ApplicationAttachmentId,
  ApplicationAuditEventId,
  ApplicationDecisionId,
  BranchId,
  LenderId,
  LenderStaffId,
  LoanApplicationId,
  LoanProductId,
  ReturnRequirementId,
} from './ids';
import type { LoanTerms } from './loan-terms';

export type ApplicationStatus = 'submitted' | 'approved' | 'rejected' | 'returned';
export type DecisionVerdict = 'approved' | 'rejected' | 'returned';
export type ApplicationActorRole = LenderStaffRole;
export type ApplicationScope = LenderScopeReference;

export type DecisionStaffSnapshot = {
  staffId: LenderStaffId;
  lenderId: LenderId;
  branchId: BranchId;
  displayName: string;
  role: 'reviewer';
};

export type DecisionDeviceSignals = {
  userAgent: string;
  platform: string;
  vendor: string;
  languages: string[];
  timeZone: string;
  screen: {
    width: number;
    height: number;
    availableWidth: number;
    availableHeight: number;
    colorDepth: number;
    pixelRatio: number;
  };
  hardwareConcurrency: number | null;
  deviceMemoryGiB: number | null;
  maxTouchPoints: number;
  cookieEnabled: boolean;
  geolocation: {
    latitude: number;
    longitude: number;
    accuracyMeters: number;
    altitudeMeters: number | null;
    altitudeAccuracyMeters: number | null;
    headingDegrees: number | null;
    speedMetersPerSecond: number | null;
    capturedAt: string;
  };
};

export type DecisionDeviceEvidence = {
  fingerprint: {
    value: string;
    algorithm: 'SHA-256';
    source: 'browser-signals-geolocation-v1';
  };
  signals: DecisionDeviceSignals;
  capturedAt: string;
};

export type DecisionAuditEnvelope = {
  id: ApplicationDecisionId;
  decidedBy: DecisionStaffSnapshot;
  device: DecisionDeviceEvidence;
  decidedAt: string;
};

export type ApprovedApplicationDecision = DecisionAuditEnvelope & {
  verdict: 'approved';
  approvalReason: string;
};

export type RejectedApplicationDecision = DecisionAuditEnvelope & {
  verdict: 'rejected';
  rejectionReason: string;
};

export type ReturnRequirement = {
  id: ReturnRequirementId;
  kind: 'correction' | 'document';
  description: string;
};

export type ReturnedApplicationDecision = DecisionAuditEnvelope & {
  verdict: 'returned';
  returnReason: string;
  requirements: ReturnRequirement[];
};

export type ApplicationDecision =
  | ApprovedApplicationDecision
  | RejectedApplicationDecision
  | ReturnedApplicationDecision;

export type ApplicationDecisionSubmission =
  | {
      verdict: 'approved';
      approvalReason: string;
    }
  | {
      verdict: 'rejected';
      rejectionReason: string;
    }
  | {
      verdict: 'returned';
      returnReason: string;
      requirements: Array<{
        kind: ReturnRequirement['kind'];
        description: string;
      }>;
    };

export type ApplicationAttachment = {
  id: ApplicationAttachmentId;
  name: string;
  status: 'clean';
};

export type ApplicationAuditEvent = {
  id: ApplicationAuditEventId;
  action: string;
  actor: string;
  role: ApplicationActorRole;
  occurredAt: string;
  relatedRecord?: {
    type: 'application-decision';
    id: ApplicationDecisionId;
  };
};

export type LoanApplication = {
  id: LoanApplicationId;
  scope: ApplicationScope;
  loanProductId: LoanProductId;
  customer: CustomerRecord;
  terms: LoanTerms;
  status: ApplicationStatus;
  createdBy: string;
  submittedAt: string;
  acknowledgementLanguage: string;
  agentAttestation: string;
  attachments: ApplicationAttachment[];
  decision?: ApplicationDecision;
  audit: ApplicationAuditEvent[];
};
