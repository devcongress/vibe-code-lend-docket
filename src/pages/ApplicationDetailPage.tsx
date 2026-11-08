import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  History,
  MapPin,
  ShieldCheck,
  Undo2,
  UserRound,
  X,
} from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';

import { resolveLenderScope } from '../../shared/domain/lender';
import type {
  ApplicationDecision,
  ApplicationDecisionSubmission,
  DecisionVerdict,
} from '../../shared/domain/loan-application';
import { resolveLoanProduct } from '../../shared/domain/loan-product';
import { StatusBadge } from '../components/ApplicationUI';
import { customerInitials, formatDateTime, formatGhs } from '../playground/model';
import { usePlayground } from '../playground/store';

export function ApplicationDetailPage({ review = false }: { review?: boolean }) {
  const { applicationId } = useParams();
  const [searchParams] = useSearchParams();
  const { applications, role, decide } = usePlayground();
  const [decisionVerdict, setDecisionVerdict] = useState<DecisionVerdict>('approved');
  const [decisionReason, setDecisionReason] = useState('');
  const [requiredCorrections, setRequiredCorrections] = useState('');
  const [requiredDocuments, setRequiredDocuments] = useState('');
  const [decisionError, setDecisionError] = useState('');
  const [decisionSubmitting, setDecisionSubmitting] = useState(false);
  const application = applications.find((candidate) => candidate.id === applicationId);

  if (!application) {
    return (
      <section className="content-card not-found-card">
        <FileText aria-hidden="true" />
        <h1>Application not found</h1>
        <p>The demo may have been reset in another tab.</p>
        <Link className="secondary-button" to="/">
          Return to overview
        </Link>
      </section>
    );
  }

  const resolvedScope = resolveLenderScope(application.scope);
  const loanProduct = resolveLoanProduct(application.loanProductId);
  const lenderName = resolvedScope?.lender.profile.displayName ?? 'Unknown lender';
  const branchName = resolvedScope?.branch.profile.name ?? 'Unknown branch';
  const productName = loanProduct?.profile.name ?? 'Unknown loan product';

  const submitDecision = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (decisionReason.trim().length < 10) {
      setDecisionError('Write a clear decision reason of at least 10 characters.');
      return;
    }

    const requirements = [
      ...requirementLines(requiredCorrections).map((description) => ({
        kind: 'correction' as const,
        description,
      })),
      ...requirementLines(requiredDocuments).map((description) => ({
        kind: 'document' as const,
        description,
      })),
    ];
    if (decisionVerdict === 'returned' && requirements.length === 0) {
      setDecisionError('Add at least one required correction or document.');
      return;
    }

    const submission: ApplicationDecisionSubmission =
      decisionVerdict === 'approved'
        ? { verdict: 'approved', approvalReason: decisionReason }
        : decisionVerdict === 'rejected'
          ? { verdict: 'rejected', rejectionReason: decisionReason }
          : { verdict: 'returned', returnReason: decisionReason, requirements };

    setDecisionSubmitting(true);
    setDecisionError('');
    try {
      await decide(application.id, submission);
    } catch (error) {
      setDecisionError(
        error instanceof Error ? error.message : 'The decision evidence could not be captured.',
      );
    } finally {
      setDecisionSubmitting(false);
    }
  };

  const canDecide = role === 'reviewer' && application.status === 'submitted';

  return (
    <div className="detail-layout">
      <div className="detail-main">
        <Link className="back-link" to={review ? '/review' : '/applications'}>
          <ArrowLeft aria-hidden="true" /> {review ? 'Review queue' : 'My applications'}
        </Link>

        {searchParams.get('created') === '1' ? (
          <div className="submission-success" role="status">
            <CheckCircle2 aria-hidden="true" />
            <div>
              <strong>Application submitted</strong>
              <span>It is now visible to the separate reviewer persona.</span>
            </div>
          </div>
        ) : null}

        <header className="detail-header">
          <div className="customer-avatar large">
            {customerInitials(application.customer.identity.fullLegalName)}
          </div>
          <div>
            <p className="eyebrow">Application {application.id}</p>
            <h1>{application.customer.identity.fullLegalName}</h1>
            <p>
              {productName} · {branchName} branch
            </p>
          </div>
          <StatusBadge status={application.status} />
        </header>

        <section className="terms-hero" aria-label="Submitted terms">
          <div>
            <span>Principal</span>
            <strong>{formatGhs(application.terms.principalPesewas)}</strong>
          </div>
          <div>
            <span>Total repayment</span>
            <strong>{formatGhs(application.terms.totalRepaymentPesewas)}</strong>
          </div>
          <div>
            <span>Term</span>
            <strong>{application.terms.repaymentCount} weeks</strong>
          </div>
          <div>
            <span>Weekly instalment</span>
            <strong>{formatGhs(application.terms.regularInstalmentPesewas)}</strong>
          </div>
        </section>

        {role === 'reviewer' && application.status === 'submitted' ? (
          <div className="separation-check">
            <span>
              <Check aria-hidden="true" />
            </span>
            <div>
              <strong>Separation of duties checked</strong>
              <p>You did not create or submit this application.</p>
            </div>
          </div>
        ) : null}

        <section className="record-sheet">
          <div className="record-sheet-header">
            <div>
              <p className="eyebrow">Submitted snapshot</p>
              <h2>Customer and livelihood</h2>
            </div>
            <span className="immutable-pill">
              <ShieldCheck aria-hidden="true" /> Immutable
            </span>
          </div>
          <dl className="fact-grid">
            <Fact label="Full legal name" value={application.customer.identity.fullLegalName} />
            <Fact label="Date of birth" value={application.customer.identity.dateOfBirth} />
            <Fact label="Mobile number" value={application.customer.contact.mobileNumber} />
            <Fact
              label="Ghana Card"
              value={`GHA-•••••••-${application.customer.identity.document.lastFour}`}
            />
            <Fact
              label="Residence"
              value={`${application.customer.address.community}, ${application.customer.address.district}`}
            />
            <Fact label="Region" value={application.customer.address.region} />
            <Fact label="Digital address" value={application.customer.address.digitalAddress} />
            <Fact label="Occupation" value={application.customer.livelihood.occupation} />
            <Fact
              label="Income source"
              value={application.customer.livelihood.primaryIncomeSource}
            />
            <Fact
              label="Declared monthly net income"
              value={formatGhs(application.customer.livelihood.monthlyNetIncomePesewas)}
            />
            <Fact
              label="Preferred language"
              value={application.customer.contact.preferredSpokenLanguage}
            />
            <Fact
              label="Verification reference"
              value={application.customer.verification.reference}
            />
            <Fact label="Verification method" value="External biometric process" />
            <Fact
              label="Verified at"
              value={formatDateTime(application.customer.verification.completedAt)}
            />
          </dl>
          <div className="attestation-card">
            <UserRound aria-hidden="true" />
            <div>
              <strong>Agent attestation</strong>
              <p>{application.agentAttestation}</p>
              <span>
                {application.createdBy} · {formatDateTime(application.submittedAt)}
              </span>
            </div>
          </div>
        </section>

        <section className="record-sheet">
          <div className="record-sheet-header">
            <div>
              <p className="eyebrow">Proposed agreement</p>
              <h2>Loan terms</h2>
            </div>
          </div>
          <dl className="fact-grid four">
            <Fact label="Principal" value={formatGhs(application.terms.principalPesewas)} />
            <Fact label="Flat rate" value={`${application.terms.flatRateBasisPoints / 100}%`} />
            <Fact label="Fixed fees" value={formatGhs(application.terms.fixedFeesPesewas)} />
            <Fact
              label="Total repayment"
              value={formatGhs(application.terms.totalRepaymentPesewas)}
            />
          </dl>
          <div className="decision-boundary">
            <ShieldCheck aria-hidden="true" />
            <p>
              <strong>Approval records a decision only.</strong> It does not move money, promise
              disbursement, or create a credit agreement.
            </p>
          </div>
        </section>

        {application.decision ? (
          <section className={`decision-record ${application.decision.verdict}`}>
            {application.decision.verdict === 'approved' ? (
              <CheckCircle2 aria-hidden="true" />
            ) : application.decision.verdict === 'returned' ? (
              <Undo2 aria-hidden="true" />
            ) : (
              <X aria-hidden="true" />
            )}
            <div>
              <p className="eyebrow">
                {application.decision.verdict === 'returned' ? 'Review outcome' : 'Final decision'}
              </p>
              <h2>{decisionTitle(application.decision)}</h2>
              <blockquote>{decisionReasonText(application.decision)}</blockquote>
              {application.decision.verdict === 'returned' ? (
                <div className="return-requirements">
                  <strong>Required before resubmission</strong>
                  <ul>
                    {application.decision.requirements.map((requirement) => (
                      <li key={requirement.id}>
                        <span>{requirement.kind === 'document' ? 'Document' : 'Correction'}</span>
                        {requirement.description}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <span>
                {application.decision.decidedBy.displayName} ·{' '}
                {formatDateTime(application.decision.decidedAt)}
              </span>
              <details className="decision-evidence">
                <summary>View audit evidence</summary>
                <dl>
                  <div>
                    <dt>Decision ID</dt>
                    <dd>{application.decision.id}</dd>
                  </div>
                  <div>
                    <dt>Verdict</dt>
                    <dd>{application.decision.verdict}</dd>
                  </div>
                  <div>
                    <dt>Lender staff</dt>
                    <dd>
                      {application.decision.decidedBy.displayName} ·{' '}
                      {application.decision.decidedBy.staffId}
                    </dd>
                  </div>
                  <div>
                    <dt>Location</dt>
                    <dd>
                      {application.decision.device.signals.geolocation.latitude.toFixed(6)},{' '}
                      {application.decision.device.signals.geolocation.longitude.toFixed(6)} · ±
                      {Math.round(application.decision.device.signals.geolocation.accuracyMeters)} m
                    </dd>
                  </div>
                  <div className="evidence-wide">
                    <dt>Device fingerprint</dt>
                    <dd>
                      <code>{application.decision.device.fingerprint.value}</code>
                    </dd>
                  </div>
                  <div className="evidence-wide">
                    <dt>Captured browser and device signals</dt>
                    <dd>
                      <pre>{JSON.stringify(application.decision.device.signals, null, 2)}</pre>
                    </dd>
                  </div>
                </dl>
              </details>
            </div>
          </section>
        ) : null}
      </div>

      <aside className="detail-aside">
        {canDecide ? (
          <form className="decision-panel" onSubmit={submitDecision}>
            <p className="eyebrow">Record decision</p>
            <h2>Choose a review outcome.</h2>
            <p>Submitted terms cannot be changed here.</p>
            <div className="decision-options">
              <label className={decisionVerdict === 'approved' ? 'selected approve' : ''}>
                <input
                  type="radio"
                  name="decision"
                  value="approved"
                  checked={decisionVerdict === 'approved'}
                  onChange={() => setDecisionVerdict('approved')}
                />
                <Check aria-hidden="true" />
                <span>
                  <strong>Approve</strong>
                  <small>Accept exactly as submitted</small>
                </span>
              </label>
              <label className={decisionVerdict === 'rejected' ? 'selected reject' : ''}>
                <input
                  type="radio"
                  name="decision"
                  value="rejected"
                  checked={decisionVerdict === 'rejected'}
                  onChange={() => setDecisionVerdict('rejected')}
                />
                <X aria-hidden="true" />
                <span>
                  <strong>Reject</strong>
                  <small>Give the agent a clear reason</small>
                </span>
              </label>
              <label
                className={`return-option ${decisionVerdict === 'returned' ? 'selected return' : ''}`}
              >
                <input
                  type="radio"
                  name="decision"
                  value="returned"
                  checked={decisionVerdict === 'returned'}
                  onChange={() => setDecisionVerdict('returned')}
                />
                <Undo2 aria-hidden="true" />
                <span>
                  <strong>Return</strong>
                  <small>Require corrections or documents</small>
                </span>
              </label>
            </div>
            <label className="field decision-note">
              <span>
                {decisionVerdict === 'approved'
                  ? 'Approval reason'
                  : decisionVerdict === 'rejected'
                    ? 'Rejection reason'
                    : 'Return reason'}
              </span>
              <textarea
                rows={5}
                value={decisionReason}
                onChange={(event) => setDecisionReason(event.target.value)}
                placeholder={
                  decisionVerdict === 'approved'
                    ? 'Why is this application acceptable?'
                    : decisionVerdict === 'rejected'
                      ? 'Why is this application being rejected?'
                      : 'Why must this application be corrected?'
                }
              />
            </label>
            {decisionVerdict === 'returned' ? (
              <div className="return-fields">
                <label className="field">
                  <span>Required corrections</span>
                  <textarea
                    rows={3}
                    value={requiredCorrections}
                    onChange={(event) => setRequiredCorrections(event.target.value)}
                    placeholder="One correction per line"
                  />
                </label>
                <label className="field">
                  <span>Required documents</span>
                  <textarea
                    rows={3}
                    value={requiredDocuments}
                    onChange={(event) => setRequiredDocuments(event.target.value)}
                    placeholder="One document per line"
                  />
                </label>
              </div>
            ) : null}
            {decisionError ? (
              <span className="field-error" role="alert">
                {decisionError}
              </span>
            ) : null}
            <button
              className={
                decisionVerdict === 'approved'
                  ? 'primary-button decision-submit'
                  : decisionVerdict === 'rejected'
                    ? 'danger-button decision-submit'
                    : 'secondary-button decision-submit'
              }
              type="submit"
              disabled={decisionSubmitting}
            >
              {decisionSubmitting
                ? 'Capturing audit evidence…'
                : decisionVerdict === 'approved'
                  ? 'Record approval'
                  : decisionVerdict === 'rejected'
                    ? 'Record rejection'
                    : 'Return for correction'}
            </button>
            <small className="final-warning">
              A fresh device location is required. Approval and rejection are final.
            </small>
          </form>
        ) : (
          <section className="aside-card">
            <Clock3 aria-hidden="true" />
            <p className="eyebrow">Record status</p>
            <h2>
              {application.status === 'submitted'
                ? 'Waiting for reviewer'
                : application.status === 'returned'
                  ? 'Waiting for correction'
                  : 'Decision complete'}
            </h2>
            <p>
              {application.status === 'submitted'
                ? 'Switch to the Reviewer persona to make an independent decision.'
                : application.status === 'returned'
                  ? 'The agent must address the recorded requirements and resubmit a new revision.'
                  : 'This application cannot receive another decision.'}
            </p>
            {application.status === 'submitted' ? (
              <Link className="secondary-button" to={`/review/${application.id}`}>
                Open reviewer view
              </Link>
            ) : null}
          </section>
        )}

        <section className="aside-card">
          <MapPin aria-hidden="true" />
          <p className="eyebrow">Lender · branch</p>
          <h2>{branchName}</h2>
          <p>{lenderName}</p>
          <p>Reviewer access is restricted to this branch in the product rules.</p>
        </section>

        <section className="aside-card audit-card">
          <History aria-hidden="true" />
          <p className="eyebrow">Audit history</p>
          <ol>
            {[...application.audit].reverse().map((event) => (
              <li key={event.id}>
                <span />
                <div>
                  <strong>{event.action}</strong>
                  <small>
                    {event.actor} · {formatDateTime(event.occurredAt)}
                  </small>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </aside>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function requirementLines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function decisionTitle(decision: ApplicationDecision) {
  switch (decision.verdict) {
    case 'approved':
      return 'Approved as submitted';
    case 'rejected':
      return 'Rejected';
    case 'returned':
      return 'Returned for correction';
  }
}

function decisionReasonText(decision: ApplicationDecision) {
  switch (decision.verdict) {
    case 'approved':
      return decision.approvalReason;
    case 'rejected':
      return decision.rejectionReason;
    case 'returned':
      return decision.returnReason;
  }
}
