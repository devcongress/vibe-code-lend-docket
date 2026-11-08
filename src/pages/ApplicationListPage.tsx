import { ArrowRight, FileSearch, Inbox } from 'lucide-react';
import { Link } from 'react-router';

import { DEMO_BRANCH } from '../../shared/domain/lender';
import { EmptyState, StatusBadge } from '../components/ApplicationUI';
import { formatDateTime, formatGhs } from '../playground/model';
import { usePlayground } from '../playground/store';

export function ApplicationListPage({ review = false }: { review?: boolean }) {
  const { applications } = usePlayground();
  const visibleApplications = review
    ? applications.filter((application) => application.status === 'submitted')
    : applications;

  return (
    <div className="page-stack">
      <header className="page-heading">
        <div>
          <p className="eyebrow">{review ? 'Reviewer workspace' : 'Agent workspace'}</p>
          <h1>{review ? 'Review queue' : 'My applications'}</h1>
          <p className="page-lede">
            {review
              ? `Complete submissions from the ${DEMO_BRANCH.profile.name} branch, oldest first.`
              : 'Fictional applications created by the demo agent.'}
          </p>
        </div>
        {!review ? (
          <Link className="primary-button" to="/applications/new">
            Start application <ArrowRight aria-hidden="true" />
          </Link>
        ) : null}
      </header>

      <section className="content-card list-card">
        {visibleApplications.length === 0 ? (
          <EmptyState icon={review ? <Inbox /> : <FileSearch />} title="Nothing waiting">
            {review
              ? 'Every submitted application has a decision.'
              : 'Start the first application.'}
          </EmptyState>
        ) : (
          <div className="record-table">
            <div className="record-table-head" aria-hidden="true">
              <span>Customer</span>
              <span>Submitted</span>
              <span>Principal</span>
              <span>Status</span>
              <span />
            </div>
            {visibleApplications.map((application) => (
              <Link
                key={application.id}
                className="record-row"
                to={`/${review ? 'review' : 'applications'}/${application.id}`}
              >
                <span className="record-customer">
                  <span className="customer-avatar">
                    {application.customer.identity.fullLegalName
                      .split(' ')
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join('')}
                  </span>
                  <span>
                    <strong>{application.customer.identity.fullLegalName}</strong>
                    <small>{application.id}</small>
                  </span>
                </span>
                <span data-label="Submitted">{formatDateTime(application.submittedAt)}</span>
                <strong data-label="Principal">
                  {formatGhs(application.terms.principalPesewas)}
                </strong>
                <span data-label="Status">
                  <StatusBadge status={application.status} />
                </span>
                <ArrowRight className="row-arrow" aria-hidden="true" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
