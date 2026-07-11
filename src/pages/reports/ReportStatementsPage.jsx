import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { reportsApi, storesApi, usersApi } from '../../api/resources.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Table } from '../../components/ui/Table.jsx';
import { currency, date } from '../../utils/format.js';
import { statusLabel } from '../../utils/status.js';

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export default function ReportStatementsPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({});
  const { register, handleSubmit } = useForm({
    defaultValues: { from: '', to: '', salesRep: '', store: '' }
  });

  const reportsQuery = useQuery({
    queryKey: ['report-statements', filters],
    queryFn: () => reportsApi.list(filters)
  });

  const usersQuery = useQuery({
    queryKey: ['report-statement-users'],
    queryFn: () => usersApi.list({ page: 1, limit: 200 }),
    enabled: user?.role === 'Admin'
  });

  const storesQuery = useQuery({
    queryKey: ['report-statement-stores'],
    queryFn: () => storesApi.list({ page: 1, limit: 200 })
  });

  const salesUsers = useMemo(
    () => (usersQuery.data?.data || []).filter((item) => item.role === 'Sales'),
    [usersQuery.data]
  );

  const onSubmit = (values) => {
    setFilters(Object.fromEntries(Object.entries(values).filter(([, value]) => value)));
  };

  const exportFile = async (type) => {
    try {
      const response = type === 'excel' ? await reportsApi.exportExcel(filters) : await reportsApi.exportPdf(filters);
      const filename = type === 'excel' ? 'كشف-بالتقارير.xlsx' : 'كشف-بالتقارير.pdf';
      downloadBlob(response.data, filename);
    } catch {
      toast.error('تعذر التصدير');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="كشف بالتقارير"
        description="تقارير حسب المسوق أو المحل أو التاريخ، مع إمكانية تصدير البيانات إلى PDF و Excel."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => exportFile('pdf')}>
              <ArrowDownTrayIcon className="h-4 w-4" />
              PDF
            </Button>
            <Button variant="secondary" onClick={() => exportFile('excel')}>
              <ArrowDownTrayIcon className="h-4 w-4" />
              Excel
            </Button>
          </div>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950 md:grid-cols-4">
        <Input label="من تاريخ" type="date" {...register('from')} />
        <Input label="إلى تاريخ" type="date" {...register('to')} />
        {user?.role === 'Admin' ? (
          <Select label="المسوق" {...register('salesRep')}>
            <option value="">الكل</option>
            {salesUsers.map((reportUser) => (
              <option key={reportUser._id} value={reportUser._id}>
                {reportUser.name}
              </option>
            ))}
          </Select>
        ) : (
          <Input label="المسوق" value={user?.name || ''} readOnly />
        )}
        <Select label="المحل" {...register('store')}>
          <option value="">الكل</option>
          {storesQuery.data?.data?.map((store) => (
            <option key={store._id} value={store._id}>
              {store.name}
            </option>
          ))}
        </Select>
        <div className="flex justify-end md:col-span-4">
          <Button type="submit">تطبيق الفلترة</Button>
        </div>
      </form>

      <Table
        columns={['رقم الفاتورة', 'المحل', 'المسوق', 'الإجمالي', 'المتبقي', 'الاستحقاق', 'الحالة']}
        data={reportsQuery.data?.invoices || []}
        renderRow={(row) => (
          <tr key={row._id}>
            <td className="px-5 py-4 font-semibold">{row.invoiceNumber}</td>
            <td className="px-5 py-4">{row.store?.name || row.storeName}</td>
            <td className="px-5 py-4">{row.salesRep?.name || row.salesRepName}</td>
            <td className="px-5 py-4">{currency(row.totalAmount)}</td>
            <td className="px-5 py-4">{currency(row.remainingAmount)}</td>
            <td className="px-5 py-4">{date(row.dueDate)}</td>
            <td className="px-5 py-4">{statusLabel(row.status)}</td>
          </tr>
        )}
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-lg font-bold">عمليات التحصيل المرتبطة بالكشف</h3>
        <div className="mt-4 space-y-3">
          {(reportsQuery.data?.collections || []).map((entry) => (
            <div key={entry._id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold">{entry.invoice?.invoiceNumber}</p>
                <p className="font-bold text-primary">{currency(entry.amountCollected)}</p>
                <p className="text-sm text-slate-500">المسوق: {entry.salesRep?.name || entry.invoice?.salesRepName || '-'}</p>
                <p className="text-sm text-slate-500">سجلها: {entry.recordedBy?.name}</p>
                <p className="text-sm text-slate-500">{date(entry.collectionDate)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-lg font-bold">التحصيل الشهري</h3>
          <Table
            columns={['الفترة', 'الإجمالي']}
            data={reportsQuery.data?.monthlySummary || []}
            renderRow={(row) => (
              <tr key={`${row._id.year}-${row._id.month}`}>
                <td className="px-5 py-4">{`${row._id.year}/${String(row._id.month).padStart(2, '0')}`}</td>
                <td className="px-5 py-4">{currency(row.total)}</td>
              </tr>
            )}
          />
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-lg font-bold">التحصيل السنوي</h3>
          <Table
            columns={['السنة', 'الإجمالي']}
            data={reportsQuery.data?.yearlySummary || []}
            renderRow={(row) => (
              <tr key={row._id.year}>
                <td className="px-5 py-4">{row._id.year}</td>
                <td className="px-5 py-4">{currency(row.total)}</td>
              </tr>
            )}
          />
        </div>
      </div>
    </div>
  );
}
