import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BanknotesIcon,
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  ReceiptPercentIcon
} from '@heroicons/react/24/outline';
import { reportsApi } from '../../api/resources.js';
import { Modal } from '../../components/ui/Modal.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { currency } from '../../utils/format.js';
import { statusLabel } from '../../utils/status.js';

const money = (value) => `${currency(value || 0)} د.ل`;

const getStoreStatus = (store) => {
  if (store.totalDebt <= 0) return { label: 'مسدد بالكامل', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300', Icon: CheckCircleIcon };
  if (store.daysRemaining === null) return { label: 'قيد التحصيل', className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300', Icon: ClockIcon };
  if (store.daysRemaining < 0) return { label: `متأخر ${Math.abs(store.daysRemaining)} يوم`, className: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300', Icon: ExclamationTriangleIcon };
  if (store.daysRemaining === 0) return { label: 'الاستحقاق اليوم', className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300', Icon: ClockIcon };
  return { label: `باقي ${store.daysRemaining} يوم`, className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300', Icon: ClockIcon };
};

const StoreProfileCard = ({ store }) => {
  const state = getStoreStatus(store);
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate text-base font-extrabold text-slate-950 dark:text-white">{store.name}</h4>
          {store.phone && (
            <a href={`tel:${store.phone}`} className="mt-1 flex items-center gap-1 text-xs font-semibold text-primary dark:text-blue-300">
              <PhoneIcon className="h-3.5 w-3.5" /> <span dir="ltr">{store.phone}</span>
            </a>
          )}
          <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${state.className}`}>
            <state.Icon className="h-3.5 w-3.5" /> {state.label}
          </span>
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-900 font-black text-white dark:bg-blue-600">
          {store.name?.trim().charAt(0)}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-red-50 p-3 dark:bg-red-950/25">
          <p className="text-[10px] font-semibold text-red-500">الدين</p>
          <p className="mt-1 text-sm font-black text-red-700 dark:text-red-200">{money(store.totalDebt)}</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-950/25">
          <p className="text-[10px] font-semibold text-emerald-600">المحصّل</p>
          <p className="mt-1 text-sm font-black text-emerald-700 dark:text-emerald-200">{money(store.totalCollected)}</p>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
        {store.invoicesCount} فاتورة، منها {store.activeInvoices} نشطة
      </p>
    </article>
  );
};

export default function SalesRepProfileModal({ salesRepId, onClose }) {
  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const profileQuery = useQuery({
    queryKey: ['reports', 'sales-rep-profile', salesRepId, selectedMonth],
    queryFn: () => reportsApi.salesRepProfile(salesRepId, { month: selectedMonth }),
    enabled: Boolean(salesRepId)
  });
  const data = profileQuery.data;
  const monthLabel = new Intl.DateTimeFormat('ar-LY', { month: 'long', year: 'numeric' }).format(
    new Date(`${data?.selectedMonth || selectedMonth}-01T12:00:00`)
  );

  return (
    <Modal open={Boolean(salesRepId)} onClose={onClose} title="بروفايل المندوب" size="xl">
      {profileQuery.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-36 rounded-3xl" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((item) => <Skeleton key={item} className="h-28 rounded-3xl" />)}
          </div>
        </div>
      ) : profileQuery.isError ? (
        <div className="rounded-3xl bg-red-50 p-6 text-center font-bold text-danger dark:bg-red-950/30">تعذر تحميل بروفايل المندوب</div>
      ) : data ? (
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white">
            <div className="absolute -left-12 -top-12 h-36 w-36 rounded-full bg-blue-500/30 blur-2xl" />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-3xl bg-white/10 text-2xl font-black backdrop-blur">
                  {data.salesRep.name?.trim().charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-black">{data.salesRep.name}</h2>
                  <p className="mt-1 text-sm text-slate-300">@{data.salesRep.username}</p>
                  <p className="mt-1 text-xs text-blue-200">{statusLabel(data.salesRep.status)}، عمولة {currency(data.salesRep.commissionRate)}%</p>
                </div>
              </div>
              <div className="min-w-52">
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <CalendarDaysIcon className="h-4 w-4" /> شهر التقرير
                </label>
                <input
                  type="month"
                  value={data.selectedMonth}
                  max={currentMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-white/15 bg-white/10 px-3 text-sm font-bold text-white outline-none backdrop-blur"
                />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <BuildingStorefrontIcon className="h-6 w-6 text-primary" />
              <p className="mt-3 text-xs text-slate-500">المحلات</p>
              <p className="mt-1 text-xl font-black dark:text-white">{data.summary.storesCount}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <DocumentTextIcon className="h-6 w-6 text-slate-700 dark:text-slate-200" />
              <p className="mt-3 text-xs text-slate-500">المجموع الكلي</p>
              <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">{money(data.summary.totalAmount)}</p>
            </div>
            <div className="rounded-3xl border border-red-100 bg-red-50 p-4 dark:border-red-950 dark:bg-red-950/25">
              <BanknotesIcon className="h-6 w-6 text-danger" />
              <p className="mt-3 text-xs text-red-500">إجمالي الدين</p>
              <p className="mt-1 text-lg font-black text-red-700 dark:text-red-200">{money(data.summary.totalDebt)}</p>
            </div>
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-950 dark:bg-emerald-950/25">
              <CheckCircleIcon className="h-6 w-6 text-success" />
              <p className="mt-3 text-xs text-emerald-600">المحصّل الكلي</p>
              <p className="mt-1 text-lg font-black text-emerald-700 dark:text-emerald-200">{money(data.summary.totalCollected)}</p>
            </div>
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-950 dark:bg-emerald-950/25">
              <CalendarDaysIcon className="h-6 w-6 text-success" />
              <p className="mt-3 text-xs text-emerald-600">تحصيل {monthLabel}</p>
              <p className="mt-1 text-lg font-black text-emerald-700 dark:text-emerald-200">{money(data.summary.monthCollected)}</p>
            </div>
            <div className="rounded-3xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-950 dark:bg-blue-950/25">
              <ReceiptPercentIcon className="h-6 w-6 text-primary" />
              <p className="mt-3 text-xs text-blue-600">عمولة الشهر</p>
              <p className="mt-1 text-lg font-black text-blue-700 dark:text-blue-200">{money(data.summary.commissionAmount)}</p>
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-950 dark:text-white">محلات المندوب</h3>
              <span className="text-xs font-semibold text-slate-500">{data.stores.length} محل</span>
            </div>
            {data.stores.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">{data.stores.map((store) => <StoreProfileCard key={store._id} store={store} />)}</div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700">لا توجد محلات مسندة لهذا المندوب</div>
            )}
          </section>

          <section>
            <h3 className="mb-3 text-lg font-black text-slate-950 dark:text-white">تحصيل {monthLabel} حسب المحل</h3>
            {data.monthlyByStore.length > 0 ? (
              <div className="space-y-2">
                {data.monthlyByStore.map((store) => (
                  <div key={store._id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                    <div>
                      <p className="font-extrabold text-slate-900 dark:text-white">{store.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{store.operationsCount} عملية تحصيل</p>
                    </div>
                    <p className="font-black text-success">{money(store.totalCollected)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">لا يوجد تحصيل في هذا الشهر</div>
            )}
          </section>
        </div>
      ) : null}
    </Modal>
  );
}
