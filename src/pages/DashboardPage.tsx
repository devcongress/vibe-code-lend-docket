import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CheckCircle2, ClipboardPlus, Clock3, FileCheck2, Inbox } from 'lucide-react';
import { Link } from 'react-router';

import { resolveLoanProduct } from '../../shared/domain/loan-product';
import { StatusBadge } from '../components/ApplicationUI';
import { getHealth } from '../lib/api';
import { formatGhs } from '../playground/model';
import { usePlayground } from '../playground/store';

export function DashboardPage() {
  const { role, applications } = usePlayground();
  const health = useQuery({
    queryKey: ['health'],
    queryFn: ({ signal }) => getHealth(signal),
    retry: 1,
  });
  const submitted = applications.filter((application) => application.status === 'submitted');
  const finalDecisions = applications.filter(
    (application) => application.status === 'approved' || application.status === 'rejected',
  );
  const recent = applications.slice(0, 3);

  return (
    <div className="page-stack">
      <section className="welcome-panel">
        <div>
          <p className="eyebrow">{role === 'agent' ? 'Agent workspace' : 'Reviewer workspace'}</p>
          <h1>
            {role === 'agent' ? 'Prepare a complete application.' : 'Make an independent decision.'}
          </h1>
          <p className="page-lede">
            {role === 'agent'
              ? 'Record the customer’s details, explain the terms, and submit the application for a separate reviewer.'
              : 'Review the exact submitted facts and approve, reject, or return the application. No funds move here.'}
          </p>
        </div>
        <Link
          className="primary-button welcome-action"
          to={role === 'agent' ? '/applications/new' : '/review'}
        >
          {role === 'agent' ? <ClipboardPlus aria-hidden="true" /> : <Inbox aria-hidden="true" />}
          {role === 'agent' ? 'Start application' : 'Open review queue'}
          <ArrowRight aria-hidden="true" />
        </Link>
      </section>

      <section className="metric-grid" aria-label="Workspace summary">
        <article className="metric-card accent-blue">
          <span className="metric-icon">
            <Clock3 aria-hidden="true" />
          </span>
          <div>
            <strong>{submitted.length}</strong>
            <span>Awaiting review</span>
          </div>
        </article>
        <article className="metric-card accent-green">
          <span className="metric-icon">
            <CheckCircle2 aria-hidden="true" />
          </span>
          <div>
            <strong>{finalDecisions.length}</strong>
            <span>Final decisions</span>
          </div>
        </article>
        <article className="metric-card accent-violet">
          <span className="metric-icon">
            <FileCheck2 aria-hidden="true" />
          </span>
          <div>
            <strong>{applications.length}</strong>
            <span>Total demo records</span>
          </div>
        </article>
      </section>

      <section className="content-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Recent activity</p>
            <h2>Applications</h2>
          </div>
          <Link className="text-link" to={role === 'agent' ? '/applications' : '/review'}>
            View all <ArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="application-list">
          {recent.map((application) => {
            const productName =
              resolveLoanProduct(application.loanProductId)?.profile.name ?? 'Unknown loan product';

            return (
              <Link
                key={application.id}
                className="application-row"
                to={`/${role === 'reviewer' ? 'review' : 'applications'}/${application.id}`}
              >
                <span className="customer-avatar">
                  {application.customer.identity.fullLegalName
                    .split(' ')
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join('')}
                </span>
                <span className="application-identity">
                  <strong>{application.customer.identity.fullLegalName}</strong>
                  <small>
                    {application.id} · {productName}
                  </small>
                </span>
                <strong className="application-amount">
                  {formatGhs(application.terms.principalPesewas)}
                </strong>
                <StatusBadge status={application.status} />
                <ArrowRight className="row-arrow" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </section>

      <div className="connection-status" role="status" aria-live="polite">
        <span className={health.isSuccess ? 'connection-dot ready' : 'connection-dot'} />
        {health.isPending
          ? 'Checking Worker'
          : health.isSuccess
            ? `Cloudflare Worker connected · ${health.data.environment}`
            : 'Worker unavailable'}
      </div>
    </div>
  );
}
