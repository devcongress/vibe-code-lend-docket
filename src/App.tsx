import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

import { AppShell } from './components/AppShell';
import { PlaygroundProvider } from './playground/store';

const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
);
const ApplicationListPage = lazy(() =>
  import('./pages/ApplicationListPage').then((module) => ({ default: module.ApplicationListPage })),
);
const NewApplicationPage = lazy(() =>
  import('./pages/NewApplicationPage').then((module) => ({ default: module.NewApplicationPage })),
);
const ApplicationDetailPage = lazy(() =>
  import('./pages/ApplicationDetailPage').then((module) => ({
    default: module.ApplicationDetailPage,
  })),
);

export default function App() {
  return (
    <PlaygroundProvider>
      <AppShell>
        <Suspense
          fallback={
            <div className="page-loading" role="status">
              Loading workspace…
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/applications" element={<ApplicationListPage />} />
            <Route path="/applications/new" element={<NewApplicationPage />} />
            <Route path="/applications/:applicationId" element={<ApplicationDetailPage />} />
            <Route path="/review" element={<ApplicationListPage review />} />
            <Route path="/review/:applicationId" element={<ApplicationDetailPage review />} />
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </Suspense>
      </AppShell>
    </PlaygroundProvider>
  );
}
