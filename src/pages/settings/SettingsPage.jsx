import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../../api/resources.js';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Switch } from '../../components/ui/Switch.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import toast from 'react-hot-toast';
import { apiAssetUrl } from '../../config/api.js';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const settingsQuery = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get });

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      companyName: '',
      collectionPeriodDays: 25,
      defaultCommissionRate: 5,
      allowCommissionView: true,
      allowPreviousMonthsView: true
    }
  });

  useEffect(() => {
    if (settingsQuery.data) {
      reset(settingsQuery.data);
    }
  }, [settingsQuery.data, reset]);

  const updateMutation = useMutation({
    mutationFn: settingsApi.update,
    onSuccess: async () => {
      toast.success('تم تحديث الإعدادات');
      await queryClient.invalidateQueries({ queryKey: ['settings'] });
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'فشل تحديث الإعدادات')
  });

  const logoMutation = useMutation({
    mutationFn: settingsApi.uploadLogo,
    onSuccess: async () => {
      toast.success('تم رفع الشعار');
      await queryClient.invalidateQueries({ queryKey: ['settings'] });
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'فشل رفع الشعار')
  });

  return (
    <div className="space-y-6">
      <PageHeader title="الإعدادات" description="إدارة الشركة، الشعار، وفترة التحصيل ونسب العمولات." />

      <form onSubmit={handleSubmit((values) => updateMutation.mutate(values))} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950 md:grid-cols-2">
        <Input label="اسم الشركة" {...register('companyName')} />
        <Input label="مدة التحصيل (يوم)" type="number" {...register('collectionPeriodDays', { valueAsNumber: true })} />
        <Input label="نسبة العمولة الافتراضية %" type="number" step="0.01" {...register('defaultCommissionRate', { valueAsNumber: true })} />
        <div className="space-y-3 md:col-span-2">
          <Switch label="السماح للمندوب برؤية العمولة" checked={watch('allowCommissionView')} onChange={(value) => setValue('allowCommissionView', value)} />
          <Switch label="السماح للمندوب برؤية الأشهر السابقة" checked={watch('allowPreviousMonthsView')} onChange={(value) => setValue('allowPreviousMonthsView', value)} />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" disabled={updateMutation.isPending}>حفظ الإعدادات</Button>
        </div>
      </form>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-lg font-bold">شعار الشركة</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">حمّل صورة PNG أو JPG لعرضها في النظام.</p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          {settingsQuery.data?.companyLogo ? (
            <img src={apiAssetUrl(settingsQuery.data.companyLogo)} alt="Logo" className="h-16 rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900" />
          ) : null}
          <Input
            label="رفع شعار جديد"
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) logoMutation.mutate(file);
            }}
            className="max-w-sm"
          />
        </div>
      </div>
    </div>
  );
}
