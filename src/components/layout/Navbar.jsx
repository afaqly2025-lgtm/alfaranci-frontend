import { MoonIcon, SunIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { Button } from '../ui/Button.jsx';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-5 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">مرحبًا بك</p>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user?.name}</h2>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={toggleTheme}>
          {theme === 'dark' ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </Button>
        <Button variant="danger" onClick={logout}>
          <ArrowRightOnRectangleIcon className="h-4 w-4" />
          تسجيل الخروج
        </Button>
      </div>
    </header>
  );
};
