import { ArrowRightOnRectangleIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { SalesNotifications } from '../notifications/SalesNotifications.jsx';

export const SalesLayout = ({ children }) => {
  const { user, settings, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary text-lg font-black text-white shadow-lg shadow-blue-600/20">
              {(settings?.companyName || 'D').trim().charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-slate-900 dark:text-white">
                {settings?.companyName || 'إدارة التحصيل'}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.name}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <SalesNotifications />
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="تغيير المظهر"
              className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={logout}
              aria-label="تسجيل الخروج"
              className="grid h-10 w-10 place-items-center rounded-xl text-danger transition hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 pb-10 pt-4 sm:px-6">{children}</main>
    </div>
  );
};
