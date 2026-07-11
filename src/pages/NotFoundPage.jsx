import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft dark:border-slate-800 dark:bg-slate-950">
        <p className="text-sm uppercase tracking-[0.35em] text-primary">404</p>
        <h1 className="mt-4 text-3xl font-black text-slate-900 dark:text-white">الصفحة غير موجودة</h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">الصفحة التي طلبتها غير متاحة أو تم نقلها.</p>
        <Button as={Link} to="/dashboard" className="mt-6">
          العودة للوحة التحكم
        </Button>
      </div>
    </div>
  );
}
