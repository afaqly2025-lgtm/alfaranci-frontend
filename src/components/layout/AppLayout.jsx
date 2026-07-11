import { Sidebar } from './Sidebar.jsx';
import { Navbar } from './Navbar.jsx';
import { SalesLayout } from './SalesLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { AdminInactivityGuard } from '../security/AdminInactivityGuard.jsx';

export const AppLayout = ({ children }) => {
  const { user } = useAuth();

  if (user?.role === 'Sales') return <SalesLayout>{children}</SalesLayout>;

  return (
    <div className="min-h-screen bg-transparent">
      <AdminInactivityGuard />
      <div className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar />
          <main className="flex-1 p-5 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
};
