import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { LockClosedIcon, ShieldCheckIcon, UserIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const getLockedSession = () => {
  try {
    return JSON.parse(sessionStorage.getItem('adminSessionLock'));
  } catch {
    sessionStorage.removeItem('adminSessionLock');
    return null;
  }
};

export default function LoginPage() {
  const { login, settings } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [lockedSession] = useState(getLockedSession);
  const isLocked = Boolean(lockedSession?.username);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { username: lockedSession?.username || '', password: '' }
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await login(values);
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'تعذر تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.22),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(22,163,74,0.12),_transparent_28%),#f8fafc] px-4 py-8 dark:bg-slate-950">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/60 bg-white/85 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="hidden flex-col justify-between bg-gradient-to-br from-secondary via-slate-900 to-slate-800 p-10 text-white lg:flex">
          <div>
            <p className="text-sm uppercase tracking-[0.5em] text-blue-300">Debt Collection ERP</p>
            <h1 className="mt-6 max-w-xl text-5xl font-black leading-tight">
              منظومة احترافية لإدارة ومتابعة التحصيل
            </h1>
            <p className="mt-6 max-w-lg text-lg text-slate-300">
              متابعة الفواتير، المحلات، التحصيل، التقارير، وسجل العمليات من لوحة واحدة سريعة وواضحة.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-300">اسم الشركة</p>
            <h2 className="mt-2 text-2xl font-bold">{settings?.companyName || 'Company Name'}</h2>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-6">
            <div className="lg:hidden">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">ERP</p>
              <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                {isLocked ? 'الجلسة مقفلة' : 'تسجيل الدخول'}
              </h2>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
              {isLocked && (
                <div className="mb-5 text-center">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-blue-50 text-primary dark:bg-blue-950/40 dark:text-blue-300">
                    <ShieldCheckIcon className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 text-xl font-black text-slate-950 dark:text-white">تم قفل النظام للحماية</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">انتهت مهلة الخمول. أدخل كلمة المرور للمتابعة.</p>
                  <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
                    <UserIcon className="h-5 w-5 text-slate-400" />
                    <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{lockedSession.name}</span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {isLocked ? (
                  <input type="hidden" {...register('username', { required: true })} />
                ) : (
                  <Input
                    label="اسم المستخدم"
                    autoComplete="username"
                    {...register('username', { required: 'اسم المستخدم مطلوب' })}
                    error={errors.username?.message}
                  />
                )}
                <Input
                  type="password"
                  label="كلمة المرور"
                  autoComplete={isLocked ? 'current-password' : 'current-password'}
                  autoFocus={isLocked}
                  {...register('password', { required: 'كلمة المرور مطلوبة' })}
                  error={errors.password?.message}
                />
              </div>

              <Button type="submit" className="mt-6 w-full py-3 text-base" disabled={loading}>
                <LockClosedIcon className="h-5 w-5" />
                {loading ? 'جارٍ التحقق...' : isLocked ? 'فتح الجلسة' : 'دخول النظام'}
              </Button>

              {!isLocked && (
                <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
                  أدخل بيانات حسابك للوصول إلى النظام.
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
