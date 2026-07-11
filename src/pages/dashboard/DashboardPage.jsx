import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowTrendingUpIcon, BanknotesIcon, BuildingStorefrontIcon, DocumentTextIcon, ExclamationTriangleIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { dashboardApi } from '../../api/resources.js';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { StatCard } from '../../components/layout/StatCard.jsx';
import { CollectionsChart } from '../../components/charts/CollectionsChart.jsx';
import { Table } from '../../components/ui/Table.jsx';
import { currency, date, number } from '../../utils/format.js';
import { statusLabel } from '../../utils/status.js';
import { useAuth } from '../../context/AuthContext.jsx';
import SalesDashboard from './SalesDashboard.jsx';

export default function DashboardPage() {
  const { user, settings } = useAuth();
  const query = useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: () => dashboardApi.get(),
    enabled: user?.role === 'Admin'
  });
  const data = query.data;

  const monthlyChart = useMemo(
    () =>
      (data?.monthlyCollections || []).map((item) => ({
        label: `${item._id.year}/${String(item._id.month).padStart(2, '0')}`,
        total: item.total
      })),
    [data]
  );

  if (user?.role === 'Sales') {
    return <SalesDashboard user={user} />;
  }

  if (query.isLoading) {
    return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">جاري تحميل اللوحة...</div>;
  }

  if (query.isError) {
    const message = query.error?.response?.data?.message || 'تعذر تحميل لوحة التحكم';
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center font-bold text-danger dark:border-red-900 dark:bg-red-950/30">
        {message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="لوحة التحكم" description="نظرة عامة مباشرة على الديون والتحصيل والفواتير." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="عدد المحلات" value={data?.cards.storesCount || 0} accent="primary" icon={<BuildingStorefrontIcon className="h-6 w-6" />} />
        <StatCard
          label={user?.role === 'Admin' ? 'عدد الفواتير' : 'الفواتير الحالية'}
          value={data?.cards.invoicesCount || 0}
          accent="slate"
          icon={<DocumentTextIcon className="h-6 w-6" />}
        />
        <StatCard
          label={user?.role === 'Admin' ? 'إجمالي الديون' : 'الديون المتأخرة'}
          value={user?.role === 'Admin' ? currency(data?.cards.totalDebt || 0) : number(data?.cards.overdueCount || 0)}
          accent="warning"
          icon={<ExclamationTriangleIcon className="h-6 w-6" />}
        />
        <StatCard
          label={user?.role === 'Admin' ? 'إجمالي المحصل' : 'التحصيل هذا الشهر'}
          value={currency(user?.role === 'Admin' ? data?.cards.totalCollected || 0 : data?.cards.currentMonthCollections || 0)}
          accent="success"
          icon={<BanknotesIcon className="h-6 w-6" />}
        />
        <StatCard
          label={user?.role === 'Admin' ? 'الفواتير المتأخرة' : 'العمولة'}
          value={
            user?.role === 'Admin'
              ? data?.cards.overdueCount || 0
              : settings?.allowCommissionView && user?.canViewCommission
                ? currency((data?.cards.currentMonthCollections || 0) * ((user?.commissionRate || settings?.defaultCommissionRate || 0) / 100))
                : 'مخفية'
          }
          accent="danger"
          icon={<ArrowTrendingUpIcon className="h-6 w-6" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <CollectionsChart data={monthlyChart} />

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
            {user?.role === 'Admin' ? 'أكثر المندوبين تحصيلاً' : 'آخر الفواتير'}
          </h3>
          <div className="space-y-3">
            {user?.role === 'Admin'
              ? (data?.topCollectors || []).map((item) => (
                  <div key={item._id || item.username} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{item.name || item.username}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.username || '---'}</p>
                      </div>
                      <span className="font-bold text-primary">{currency(item.totalCollected || 0)}</span>
                    </div>
                  </div>
                ))
              : (data?.recentInvoices || []).map((invoice) => (
                  <div key={invoice._id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{invoice.storeName}</p>
                      </div>
                      <span className="font-bold text-primary">{currency(invoice.remainingAmount)}</span>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>

      <Table
        columns={['رقم الفاتورة', 'المحل', 'المندوب', 'الإجمالي', 'المتبقي', 'الاستحقاق', 'الحالة']}
        data={data?.recentInvoices || []}
        renderRow={(row) => (
          <tr key={row._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60">
            <td className="px-5 py-4 font-semibold text-slate-900 dark:text-slate-100">{row.invoiceNumber}</td>
            <td className="px-5 py-4">{row.storeName}</td>
            <td className="px-5 py-4">{row.salesRepName}</td>
            <td className="px-5 py-4">{currency(row.totalAmount)}</td>
            <td className="px-5 py-4">{currency(row.remainingAmount)}</td>
            <td className="px-5 py-4">{date(row.dueDate)}</td>
            <td className="px-5 py-4">{statusLabel(row.status)}</td>
          </tr>
        )}
      />
    </div>
  );
}
