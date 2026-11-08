import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  calculateTerms,
  createCustomerRecord,
  DEMO_AGENT,
  DEMO_APPLICATION_SCOPE,
  DEMO_DECISION_DEVICE_EVIDENCE,
  DEMO_REVIEWER,
  type DemoRole,
  type NewApplicationInput,
} from './model';
import { DEMO_REVIEWER_STAFF } from '../../shared/domain/lender-staff';
import { createDomainId, type LoanApplicationId } from '../../shared/domain/ids';
import type {
  ApplicationDecision,
  ApplicationDecisionSubmission,
  DecisionAuditEnvelope,
  LoanApplication,
} from '../../shared/domain/loan-application';
import { DEMO_LOAN_PRODUCT } from '../../shared/domain/loan-product';
import { captureDecisionDeviceEvidence } from './decision-evidence';

const STORAGE_KEY = 'lenddocket.playground.v8';

const seededApplications: LoanApplication[] = [
  {
    id: 'lappl_2408',
    scope: DEMO_APPLICATION_SCOPE,
    loanProductId: DEMO_LOAN_PRODUCT.id,
    status: 'submitted',
    createdBy: DEMO_AGENT,
    submittedAt: '2026-11-08T09:42:00.000Z',
    acknowledgementLanguage: 'Twi',
    agentAttestation:
      'Customer information and proposed terms were read back in Twi and verbally acknowledged.',
    customer: {
      identity: {
        fullLegalName: 'Akosua Mensah',
        dateOfBirth: '1988-06-14',
        document: { kind: 'ghana-card', lastFour: '4821' },
      },
      contact: {
        mobileNumber: '024 555 0142',
        preferredSpokenLanguage: 'Twi',
      },
      address: {
        community: 'Bantama',
        district: 'Kumasi Metropolitan',
        region: 'Ashanti',
        digitalAddress: 'AK-039-5021',
      },
      livelihood: {
        occupation: 'Market trader',
        primaryIncomeSource: 'Retail provisions',
        monthlyNetIncomePesewas: 320_000,
      },
      verification: {
        kind: 'external-biometric',
        reference: 'BV-348221',
        completedAt: '2026-11-08T09:31:00.000Z',
      },
    },
    terms: calculateTerms(8_000),
    attachments: [
      { id: 'lfile_2408_1', name: 'Income statement.pdf', status: 'clean' },
      { id: 'lfile_2408_2', name: 'Business premises.jpg', status: 'clean' },
    ],
    audit: [
      {
        id: 'laudit_2408_1',
        action: 'Draft created',
        actor: DEMO_AGENT,
        role: 'agent',
        occurredAt: '2026-11-07T15:12:00.000Z',
      },
      {
        id: 'laudit_2408_2',
        action: 'Application submitted',
        actor: DEMO_AGENT,
        role: 'agent',
        occurredAt: '2026-11-08T09:42:00.000Z',
      },
    ],
  },
  {
    id: 'lappl_2407',
    scope: DEMO_APPLICATION_SCOPE,
    loanProductId: DEMO_LOAN_PRODUCT.id,
    status: 'approved',
    createdBy: DEMO_AGENT,
    submittedAt: '2026-11-07T13:18:00.000Z',
    acknowledgementLanguage: 'English',
    agentAttestation:
      'Customer information and proposed terms were read back in English and verbally acknowledged.',
    customer: {
      identity: {
        fullLegalName: 'Kwame Boateng',
        dateOfBirth: '1979-02-03',
        document: { kind: 'ghana-card', lastFour: '7712' },
      },
      contact: {
        mobileNumber: '020 555 0177',
        preferredSpokenLanguage: 'English',
      },
      address: {
        community: 'Asokwa',
        district: 'Kumasi Metropolitan',
        region: 'Ashanti',
        digitalAddress: 'AK-102-8850',
      },
      livelihood: {
        occupation: 'Carpenter',
        primaryIncomeSource: 'Furniture commissions',
        monthlyNetIncomePesewas: 280_000,
      },
      verification: {
        kind: 'external-biometric',
        reference: 'BV-348103',
        completedAt: '2026-11-07T13:04:00.000Z',
      },
    },
    terms: calculateTerms(5_500),
    attachments: [{ id: 'lfile_2407_1', name: 'Income statement.pdf', status: 'clean' }],
    decision: {
      id: 'ldec_2407_1',
      verdict: 'approved',
      approvalReason:
        'Income record and repayment amount are consistent with the submitted application.',
      decidedBy: {
        staffId: DEMO_REVIEWER_STAFF.id,
        lenderId: DEMO_REVIEWER_STAFF.lenderId,
        branchId: DEMO_REVIEWER_STAFF.branchId,
        displayName: DEMO_REVIEWER_STAFF.profile.displayName,
        role: DEMO_REVIEWER_STAFF.role,
      },
      device: DEMO_DECISION_DEVICE_EVIDENCE,
      decidedAt: '2026-11-07T14:02:00.000Z',
    },
    audit: [
      {
        id: 'laudit_2407_1',
        action: 'Application submitted',
        actor: DEMO_AGENT,
        role: 'agent',
        occurredAt: '2026-11-07T13:18:00.000Z',
      },
      {
        id: 'laudit_2407_2',
        action: 'Application approved',
        actor: DEMO_REVIEWER,
        role: 'reviewer',
        occurredAt: '2026-11-07T14:02:00.000Z',
        relatedRecord: {
          type: 'application-decision',
          id: 'ldec_2407_1',
        },
      },
    ],
  },
];

type PlaygroundState = {
  role: DemoRole;
  applications: LoanApplication[];
};

type PlaygroundContextValue = PlaygroundState & {
  setRole: (role: DemoRole) => void;
  createAndSubmit: (input: NewApplicationInput) => string;
  decide: (
    applicationId: LoanApplicationId,
    submission: ApplicationDecisionSubmission,
  ) => Promise<void>;
  reset: () => void;
};

const PlaygroundContext = createContext<PlaygroundContextValue | null>(null);

function loadState(): PlaygroundState {
  const initialState: PlaygroundState = { role: 'agent', applications: seededApplications };

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialState;
    const parsed = JSON.parse(saved) as Partial<PlaygroundState>;
    if (!Array.isArray(parsed.applications)) return initialState;
    if (parsed.role !== 'agent' && parsed.role !== 'reviewer') return initialState;
    return { role: parsed.role, applications: parsed.applications };
  } catch {
    return initialState;
  }
}

export function PlaygroundProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlaygroundState>(loadState);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setRole = useCallback((role: DemoRole) => {
    setState((current) => ({ ...current, role }));
  }, []);

  const createAndSubmit = useCallback((input: NewApplicationInput) => {
    const id = createDomainId('lappl');
    const submittedAt = new Date().toISOString();
    const application: LoanApplication = {
      id,
      scope: DEMO_APPLICATION_SCOPE,
      loanProductId: DEMO_LOAN_PRODUCT.id,
      status: 'submitted',
      createdBy: DEMO_AGENT,
      submittedAt,
      acknowledgementLanguage: input.preferredLanguage,
      agentAttestation: `Customer information and proposed terms were read back in ${input.preferredLanguage} and verbally acknowledged.`,
      customer: createCustomerRecord(input),
      terms: calculateTerms(input.principalGhs),
      attachments: [
        { id: createDomainId('lfile'), name: 'Demo income record.pdf', status: 'clean' },
        { id: createDomainId('lfile'), name: 'Demo business premises.jpg', status: 'clean' },
      ],
      audit: [
        {
          id: createDomainId('laudit'),
          action: 'Draft created',
          actor: DEMO_AGENT,
          role: 'agent',
          occurredAt: submittedAt,
        },
        {
          id: createDomainId('laudit'),
          action: 'Application submitted',
          actor: DEMO_AGENT,
          role: 'agent',
          occurredAt: submittedAt,
        },
      ],
    };

    setState((current) => ({
      ...current,
      applications: [application, ...current.applications],
    }));
    return id;
  }, []);

  const decide = useCallback(
    async (applicationId: LoanApplicationId, submission: ApplicationDecisionSubmission) => {
      const device = await captureDecisionDeviceEvidence();
      const decidedAt = new Date().toISOString();
      const decisionId = createDomainId('ldec');
      const envelope: DecisionAuditEnvelope = {
        id: decisionId,
        decidedBy: {
          staffId: DEMO_REVIEWER_STAFF.id,
          lenderId: DEMO_REVIEWER_STAFF.lenderId,
          branchId: DEMO_REVIEWER_STAFF.branchId,
          displayName: DEMO_REVIEWER_STAFF.profile.displayName,
          role: DEMO_REVIEWER_STAFF.role,
        },
        device,
        decidedAt,
      };
      const decision: ApplicationDecision =
        submission.verdict === 'approved'
          ? {
              ...envelope,
              verdict: 'approved',
              approvalReason: submission.approvalReason.trim(),
            }
          : submission.verdict === 'rejected'
            ? {
                ...envelope,
                verdict: 'rejected',
                rejectionReason: submission.rejectionReason.trim(),
              }
            : {
                ...envelope,
                verdict: 'returned',
                returnReason: submission.returnReason.trim(),
                requirements: submission.requirements.map((requirement) => ({
                  id: createDomainId('lreq'),
                  kind: requirement.kind,
                  description: requirement.description.trim(),
                })),
              };
      setState((current) => ({
        ...current,
        applications: current.applications.map((application) => {
          if (application.id !== applicationId || application.status !== 'submitted') {
            return application;
          }

          return {
            ...application,
            status: submission.verdict,
            decision,
            audit: [
              ...application.audit,
              {
                id: createDomainId('laudit'),
                action:
                  submission.verdict === 'approved'
                    ? 'Application approved'
                    : submission.verdict === 'rejected'
                      ? 'Application rejected'
                      : 'Application returned for correction',
                actor: DEMO_REVIEWER,
                role: 'reviewer' as const,
                occurredAt: decidedAt,
                relatedRecord: {
                  type: 'application-decision' as const,
                  id: decisionId,
                },
              },
            ],
          };
        }),
      }));
    },
    [],
  );

  const reset = useCallback(() => {
    setState({ role: 'agent', applications: seededApplications });
  }, []);

  const value = useMemo(
    () => ({ ...state, setRole, createAndSubmit, decide, reset }),
    [state, setRole, createAndSubmit, decide, reset],
  );

  return <PlaygroundContext value={value}>{children}</PlaygroundContext>;
}

// Keeping the consumer hook beside its provider makes the playground state boundary explicit.
// oxlint-disable-next-line react/only-export-components
export function usePlayground() {
  const value = useContext(PlaygroundContext);
  if (!value) throw new Error('usePlayground must be used inside PlaygroundProvider.');
  return value;
}
