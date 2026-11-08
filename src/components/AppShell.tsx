import {
  ClipboardPlus,
  FileCheck2,
  Inbox,
  LayoutDashboard,
  RotateCcw,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router';

import { DEMO_BRANCH, DEMO_LENDER } from '../../shared/domain/lender';
import { DEMO_AGENT, DEMO_REVIEWER, type DemoRole } from '../playground/model';
import { usePlayground } from '../playground/store';

const agentNavigation = [
  { to: '/', label: 'Overview', shortLabel: 'Overview', icon: LayoutDashboard },
  { to: '/applications/new', label: 'New application', shortLabel: 'New', icon: ClipboardPlus },
  { to: '/applications', label: 'My applications', shortLabel: 'Mine', icon: FileCheck2 },
];

const reviewerNavigation = [
  { to: '/', label: 'Overview', shortLabel: 'Overview', icon: LayoutDashboard },
  { to: '/review', label: 'Review queue', shortLabel: 'Queue', icon: Inbox },
];

function RoleButton({ role, children }: { role: DemoRole; children: ReactNode }) {
  const navigate = useNavigate();
  const { role: activeRole, setRole } = usePlayground();
  const active = role === activeRole;

  return (
    <button
      type="button"
      className={active ? 'role-button active' : 'role-button'}
      aria-pressed={active}
      onClick={() => {
        setRole(role);
        navigate(role === 'reviewer' ? '/review' : '/');
      }}
    >
      {children}
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { role, applications, reset } = usePlayground();
  const navigation = role === 'agent' ? agentNavigation : reviewerNavigation;
  const openReviews = applications.filter(
    (application) => application.status === 'submitted',
  ).length;
  const persona = role === 'agent' ? DEMO_AGENT : DEMO_REVIEWER;

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <NavLink className="wordmark" to="/" aria-label="LendDocket home">
          <span className="logo-mark">
            <FileCheck2 aria-hidden="true" />
          </span>
          <span>LendDocket</span>
        </NavLink>

        <div className="demo-tenant">
          <span className="avatar avatar-tenant">AA</span>
          <span>
            <strong>{DEMO_LENDER.profile.displayName}</strong>
            <small>{DEMO_BRANCH.profile.name} branch</small>
          </span>
        </div>

        <nav className="primary-nav" aria-label="Primary navigation">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to !== '/review'}
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
              {label === 'Review queue' && openReviews > 0 ? (
                <span className="nav-count">{openReviews}</span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <div className="boundary-note">
          <ShieldCheck aria-hidden="true" />
          <strong>Decision record only</strong>
          <span>Approval never moves or promises funds.</span>
        </div>

        <div className="sidebar-persona">
          <span className="avatar">{role === 'agent' ? 'KA' : 'AD'}</span>
          <span>
            <strong>{persona}</strong>
            <small>{role === 'agent' ? 'Agent' : 'Reviewer'} · Demo persona</small>
          </span>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <NavLink className="mobile-wordmark" to="/" aria-label="LendDocket home">
            <span className="logo-mark">
              <FileCheck2 aria-hidden="true" />
            </span>
            <strong>LendDocket</strong>
          </NavLink>

          <div className="demo-banner">
            <span className="demo-dot" />
            Fictional demo data
          </div>

          <div className="role-switcher" aria-label="Choose demo persona">
            <RoleButton role="agent">
              <UserRound aria-hidden="true" />
              Agent
            </RoleButton>
            <RoleButton role="reviewer">
              <ShieldCheck aria-hidden="true" />
              Reviewer
            </RoleButton>
          </div>

          <button
            type="button"
            className="icon-button reset-button"
            onClick={() => {
              reset();
              window.location.assign('/');
            }}
            title="Reset demo data"
            aria-label="Reset demo data"
          >
            <RotateCcw aria-hidden="true" />
          </button>
        </header>

        <main className="page">{children}</main>

        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navigation.map(({ to, shortLabel, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to !== '/review'}
              className={({ isActive }) =>
                isActive ? 'mobile-nav-item active' : 'mobile-nav-item'
              }
            >
              <Icon aria-hidden="true" />
              <span>{shortLabel}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
