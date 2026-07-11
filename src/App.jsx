import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { AppLayout } from './components/layout/AppLayout.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import DashboardPage from './pages/dashboard/DashboardPage.jsx';
import UsersPage from './pages/users/UsersPage.jsx';
import StoresPage from './pages/stores/StoresPage.jsx';
import InvoicesPage from './pages/invoices/InvoicesPage.jsx';
import CollectionsPage from './pages/collections/CollectionsPage.jsx';
import SettingsPage from './pages/settings/SettingsPage.jsx';
import ReportsPage from './pages/reports/ReportsPage.jsx';
import ReportStatementsPage from './pages/reports/ReportStatementsPage.jsx';
import AuditLogsPage from './pages/audit/AuditLogsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

const Protected = ({ children, adminOnly = false }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500 dark:text-slate-300">
        جاري التحميل...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'Admin') return <Navigate to="/dashboard" replace />;
  return <AppLayout>{children}</AppLayout>;
};

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <Protected>
            <DashboardPage />
          </Protected>
        }
      />
      <Route
        path="/users"
        element={
          <Protected adminOnly>
            <UsersPage />
          </Protected>
        }
      />
      <Route
        path="/stores"
        element={
          <Protected>
            <StoresPage />
          </Protected>
        }
      />
      <Route
        path="/invoices"
        element={
          <Protected>
            <InvoicesPage />
          </Protected>
        }
      />
      <Route
        path="/collections"
        element={
          <Protected>
            <CollectionsPage />
          </Protected>
        }
      />
      <Route
        path="/settings"
        element={
          <Protected adminOnly>
            <SettingsPage />
          </Protected>
        }
      />
      <Route
        path="/reports"
        element={
          <Protected adminOnly>
            <ReportsPage />
          </Protected>
        }
      />
      <Route
        path="/report-statements"
        element={
          <Protected>
            <ReportStatementsPage />
          </Protected>
        }
      />
      <Route
        path="/audit-logs"
        element={
          <Protected adminOnly>
            <AuditLogsPage />
          </Protected>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
