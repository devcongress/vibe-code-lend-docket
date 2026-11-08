export type {
  ApplicationDecisionSubmission,
  ApplicationDecision,
  ApprovedApplicationDecision,
  DecisionDeviceEvidence,
  DecisionDeviceSignals,
  DecisionStaffSnapshot,
  DecisionVerdict,
  RejectedApplicationDecision,
  ReturnedApplicationDecision,
  ReturnRequirement,
} from '../../../shared/domain/loan-application';
export { fingerprintDecisionDeviceSignals } from '../../../shared/domain/decision-evidence';
export type { ApplicationDecisionId, ReturnRequirementId } from '../../../shared/domain/ids';

export const reviewsModule = 'reviews' as const;
