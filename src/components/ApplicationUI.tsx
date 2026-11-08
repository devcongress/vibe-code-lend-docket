import { Check, Clock3, Undo2, X } from 'lucide-react';
import type { ReactNode } from 'react';

import type { ApplicationStatus } from '../../shared/domain/loan-application';

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const content = {
    submitted: { label: 'Awaiting review', icon: Clock3 },
    approved: { label: 'Approved', icon: Check },
    rejected: { label: 'Rejected', icon: X },
    returned: { label: 'Returned', icon: Undo2 },
  }[status];
  const Icon = content.icon;

  return (
    <span className={`status-badge ${status}`}>
      <Icon aria-hidden="true" />
      {content.label}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon}</span>
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}
