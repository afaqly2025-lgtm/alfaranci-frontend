import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeftIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { reportsApi } from '../../api/resources.js';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { currency } from '../../utils/format.js';
import { statusLabel } from '../../utils/status.js';
import SalesRepProfileModal from './SalesRepProfileModal.jsx';

const money = (value) => `${currency(value || 0)} د.ل`;

export default function ReportsPage() {
  const [selectedSalesRepId, setSelectedSalesRepId] = useState(null);

  const marketersQuery = useQuery({
    queryKey: ['marketers-profiles-summary'],
    queryFn: reportsApi.salesRepProfilesSummary
  });

  const marketers = marketersQuery.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="المسوقين"
        description="بروفايلات المسوقين مع ملخص سريع للدين والمحصّل. اضغط على الكارد لعرض التفاصيل الكاملة."
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-950 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white">
              <UserGroupIcon className="h-6 w-6 text-primary" />
              بروفايلات المسوقين
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              الكارد يعرض الدين والمحصّل فقط، وباقي التفاصيل تظهر عند فتح البروفايل.
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-primary dark:bg-blue-950/40">
            {marketers.length} مسوق
          </span>
        </div>

        {marketersQuery.isLoading ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-40 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-900" />
            ))}
          </div>
        ) : marketers.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {marketers.map((marketer) => (
              <button
                key={marketer._id}
                type="button"
                onClick={() => setSelectedSalesRepId(marketer._id)}
                className="group rounded-3xl border border-slate-200 bg-slate-50 p-4 text-right transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-blue-50/70 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800 dark:hover:bg-blue-950/20"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-900 text-lg font-black text-white dark:bg-blue-600">
                      {marketer.name?.trim().charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-extrabold text-slate-950 dark:text-white">{marketer.name}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">@{marketer.username}</p>
                      <p className="mt-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {statusLabel(marketer.status)} | {marketer.storesCount} محل | {marketer.invoicesCount} فاتورة
                      </p>
                    </div>
                  </div>
                  <ChevronLeftIcon className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:-translate-x-1 group-hover:text-primary" />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-red-50 p-3 dark:bg-red-950/25">
                    <p className="text-[10px] font-bold text-red-500">الدين</p>
                    <p className="mt-1 text-sm font-black text-red-700 dark:text-red-200">{money(marketer.totalDebt)}</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-950/25">
                    <p className="text-[10px] font-bold text-emerald-600">المحصّل</p>
                    <p className="mt-1 text-sm font-black text-emerald-700 dark:text-emerald-200">{money(marketer.totalCollected)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
            لا يوجد مسوقون بعد
          </div>
        )}
      </section>

      <SalesRepProfileModal salesRepId={selectedSalesRepId} onClose={() => setSelectedSalesRepId(null)} />
    </div>
  );
}
