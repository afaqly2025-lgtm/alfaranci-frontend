import { useQuery } from '@tanstack/react-query';
import {
  BanknotesIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { storesApi } from '../../api/resources.js';
import { Modal } from '../../components/ui/Modal.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { currency, date } from '../../utils/format.js';
import { statusLabel } from '../../utils/status.js';

const money = (value) => `${currency(value || 0)} د.ل`;

const SummaryCard = ({ title, value, icon: Icon, className = '' }) => (
  <div className={`rounded-3xl border p-4 ${className}`}>
    <Icon className="h-6 w-6" />
    <p className="mt-3 text-xs opacity-75">{title}</p>
    <p className="mt-1 text-lg font-black">{value}</p>
  </div>
);

export default function StoreProfileModal({ storeId, onClose }) {
  const profileQuery = useQuery({
    queryKey: ['stores', 'profile', storeId],
    queryFn: () => storesApi.profile(storeId),
    enabled: Boolean(storeId)
  });

  const data = profileQuery.data;

  return (
    <Modal open={Boolean(storeId)} onClose={onClose} title="بروفايل المحل" size="xl">
      {profileQuery.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-36 rounded-3xl" />
          <div className="grid gap-3 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-28 rounded-3xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      ) : profileQuery.isError ? (
        <div className="rounded-3xl bg-red-50 p-6 text-center font-bold text-danger dark:bg-red-950/30">
          تعذر تحميل بيانات المحل
        </div>
      ) : data ? (
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white">
            <div className="absolute -left-14 -top-14 h-40 w-40 rounded-full bg-blue-500/25 blur-2xl" />
            <div className="absolute -bottom-16 right-8 h-40 w-40 rounded-full bg-emerald-500/15 blur-3xl" />
            <div className="relative flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-white/10 text-2xl font-black backdrop-blur">
                  {data.store.name?.trim().charAt(0) || <BuildingStorefrontIcon className="h-8 w-8" />}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-black">{data.store.name}</h2>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                    <span className="inline-flex items-center gap-1">
                      <UserIcon className="h-4 w-4" />
                      {data.store.assignedSalesRep?.name || 'بدون مندوب'}
                    </span>
                    {data.store.phone && (
                      <span className="inline-flex items-center gap-1" dir="ltr">
                        <PhoneIcon className="h-4 w-4" />
                        {data.store.phone}
                      </span>
                    )}
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                    <MapPinIcon className="h-4 w-4" />
                    {[data.store.region, data.store.address].filter(Boolean).join('، ') || 'لم يتم تحديد العنوان'}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3 text-center backdrop-blur">
                <p className="text-2xl font-black">{data.summary.invoicesCount}</p>
                <p className="text-[11px] text-slate-300">فاتورة</p>
              </div>
            </div>
            {data.store.notes && (
              <p className="relative mt-4 rounded-2xl bg-white/10 p-3 text-xs leading-6 text-slate-200">{data.store.notes}</p>
            )}
          </section>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="مجموع الدين"
              value={money(data.summary.totalDebt)}
              icon={BanknotesIcon}
              className="border-red-100 bg-red-50 text-red-700 dark:border-red-950 dark:bg-red-950/25 dark:text-red-200"
            />
            <SummaryCard
              title="مجموع التحصيل"
              value={money(data.summary.totalCollected)}
              icon={CheckCircleIcon}
              className="border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-950 dark:bg-emerald-950/25 dark:text-emerald-200"
            />
            <SummaryCard
              title="إجمالي الفواتير"
              value={money(data.summary.totalInvoiced)}
              icon={DocumentTextIcon}
              className="border-blue-100 bg-blue-50 text-blue-700 dark:border-blue-950 dark:bg-blue-950/25 dark:text-blue-200"
            />
            <SummaryCard
              title="الدين المتأخر"
              value={money(data.summary.overdueDebt)}
              icon={ClockIcon}
              className="border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-950 dark:bg-amber-950/25 dark:text-amber-200"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-950 dark:text-white">آخر عمليات التحصيل</h3>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                  {data.summary.collectionsCount} عملية
                </span>
              </div>
              {data.latestCollections.length > 0 ? (
                <div className="space-y-3">
                  {data.latestCollections.map((entry) => (
                    <article key={entry._id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-extrabold text-slate-950 dark:text-white">
                            فاتورة {entry.invoice?.invoiceNumber || '-'}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            سجلها: {entry.recordedBy?.name || '-'} | {date(entry.collectionDate)}
                          </p>
                          {entry.notes && <p className="mt-2 text-xs text-slate-500">{entry.notes}</p>}
                        </div>
                        <p className="shrink-0 font-black text-success">{money(entry.amountCollected)}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
                  لا توجد عمليات تحصيل بعد
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-950 dark:text-white">آخر الفواتير</h3>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-primary dark:bg-blue-950/30">
                  {data.summary.activeInvoices} نشطة
                </span>
              </div>
              {data.latestInvoices.length > 0 ? (
                <div className="space-y-3">
                  {data.latestInvoices.map((invoice) => (
                    <article key={invoice._id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-extrabold text-slate-950 dark:text-white">فاتورة {invoice.invoiceNumber}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {date(invoice.invoiceDate)} | الاستحقاق {date(invoice.dueDate)}
                          </p>
                          <p className="mt-2 text-xs font-bold text-primary">{statusLabel(invoice.status)}</p>
                        </div>
                        <div className="shrink-0 text-left">
                          <p className="text-sm font-black text-slate-900 dark:text-white">{money(invoice.totalAmount)}</p>
                          <p className="mt-1 text-xs font-bold text-red-600">{money(invoice.remainingAmount)} متبقي</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
                  لا توجد فواتير بعد
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </Modal>
  );
}
