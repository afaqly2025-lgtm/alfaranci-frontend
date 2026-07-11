import { NavLink } from 'react-router-dom';
import {
  BanknotesIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  HomeIcon,
  ShieldCheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn.js';
import { useAuth } from '../../context/AuthContext.jsx';

const nav = [
  { to: '/dashboard', label: 'لوحة التحكم', icon: HomeIcon },
  { to: '/stores', label: 'المحلات', icon: BuildingStorefrontIcon },
  { to: '/invoices', label: 'الفواتير', icon: DocumentTextIcon },
  { to: '/collections', label: 'التحصيل', icon: BanknotesIcon },
  { to: '/reports', label: 'المسوقين', icon: UserGroupIcon, adminOnly: true },
  { to: '/report-statements', label: 'كشف بالتقارير', icon: ChartBarIcon },
  { to: '/audit-logs', label: 'سجل العمليات', icon: ShieldCheckIcon, adminOnly: true },
  { to: '/users', label: 'المستخدمون', icon: UserGroupIcon, adminOnly: true },
  { to: '/settings', label: 'الإعدادات', icon: Cog6ToothIcon, adminOnly: true }
];

export const Sidebar = () => {
  const { user, settings } = useAuth();

  return (
    <aside className="flex w-full flex-col border-b border-slate-200 bg-white/80 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85 lg:h-screen lg:w-72 lg:border-b-0 lg:border-l">
      <div className="rounded-3xl bg-gradient-to-br from-secondary to-slate-800 p-5 text-white shadow-soft">
        <p className="text-xs uppercase tracking-[0.3em] text-blue-200">ERP</p>
        <h2 className="mt-3 text-2xl font-black">{settings?.companyName || 'Debt Collection'}</h2>
        <p className="mt-2 text-sm text-slate-300">{user?.name}</p>
      </div>

      <nav className="mt-6 grid gap-2 sm:grid-cols-2 lg:block lg:space-y-2">
        {nav
          .filter((item) => !item.adminOnly || user?.role === 'Admin')
          .map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition',
                  isActive
                    ? 'bg-primary text-white shadow-soft'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
                )
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
};
