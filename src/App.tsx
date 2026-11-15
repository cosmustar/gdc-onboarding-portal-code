import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DataProvider } from './context/DataContext';
import { SessionProvider } from './context/SessionContext';
import { AccessesPage } from './pages/AccessesPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { OverviewPage } from './pages/OverviewPage';

/**
 * Provider order matters:
 *   SessionProvider  — who is signed in (mock today, Okta OIDC later)
 *   DataProvider     — loads data authorized for that session
 *   Routes           — pages read only from DataProvider
 */
export function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <DataProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/overview" replace />} />
              <Route path="/overview" element={<OverviewPage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/accesses" element={<AccessesPage />} />
              <Route path="*" element={<Navigate to="/overview" replace />} />
            </Route>
          </Routes>
        </DataProvider>
      </SessionProvider>
    </BrowserRouter>
  );
}
