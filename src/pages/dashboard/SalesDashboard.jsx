import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BanknotesIcon,
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { currency } from '../../utils/format.js';
import { dashboardApi } from '../../api/resources.js';
import { apiAssetUrl } from '../../config/api.js';

const money = (value) => `${currency(value || 0)} د.ل`;

const filters = [
  { key: 'all', label: 'الكل' },
  { key: 'overdue', label: 'متأخرة' },
  { key: 'active', label: 'قيد التحصيل' },
  { key: 'settled', label: 'مسددة' }
];

const getCollectionState = (store) => {
  if (store.totalDebt <= 0) {
    return {
      label: 'مسدد بالكامل',
      className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
      icon: CheckCircleIcon
    };
  }
  if (store.daysRemaining === null || store.daysRemaining === undefined) {
    return {
      label: 'قيد التحصيل',
      className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
      icon: ClockIcon
    };
  }
  if (store.daysRemaining < 0) {
    return {
      label: `متأخر ${Math.abs(store.daysRemaining)} يوم`,
      className: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
      icon: ExclamationTriangleIcon
    };
  }
  if (store.daysRemaining === 0) {
    return {
      label: 'الاستحقاق اليوم',
      className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
      icon: ClockIcon
    };
  }
  return {
    label: `باقي ${store.daysRemaining} يوم`,
    className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    icon: ClockIcon
  };
};

const StoreCard = ({ store }) => {
  const state = getCollectionState(store);
  const StateIcon = state.icon;
  const attachedInvoice = store.latestInvoiceFile;
  const progress = store.totalInvoiced > 0
    ? Math.min(100, Math.round((store.totalCollected / store.totalInvoiced) * 100))
    : 0;
  const openAttachedInvoice = () => {
    if (!attachedInvoice?.url) return;
    window.open(apiAssetUrl(attachedInvoice.url), '_blank', 'noopener,noreferrer');
  };

  return (
    <article
      onClick={attachedInvoice ? openAttachedInvoice : undefined}
      className={`overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.06)] transition dark:border-slate-800 dark:bg-slate-900 ${
        attachedInvoice ? 'cursor-pointer active:scale-[0.99] sm:hover:-translate-y-0.5 sm:hover:shadow-lg' : ''
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-900 text-lg font-black text-white dark:bg-blue-600">
              {store.name?.trim().charAt(0) || <BuildingStorefrontIcon className="h-6 w-6" />}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-extrabold text-slate-950 dark:text-white sm:text-lg">{store.name}</h2>
              {store.phone ? (
                <a
                  href={`tel:${store.phone}`}
                  onClick={(event) => event.stopPropagation()}
                  className="mt-1 flex items-center gap-1 text-xs font-semibold text-primary dark:text-blue-300"
                >
                  <PhoneIcon className="h-3.5 w-3.5" />
                  <span dir="ltr">{store.phone}</span>
                </a>
              ) : (
                <p className="mt-1 text-xs text-slate-400">لا يوجد رقم هاتف</p>
              )}
              <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${state.className}`}>
                <StateIcon className="h-3.5 w-3.5" />
                {state.label}
              </span>
            </div>
          </div>

          {store.phone && (
            <a
              href={`tel:${store.phone}`}
              onClick={(event) => event.stopPropagation()}
              aria-label={`اتصال بـ ${store.name}`}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-primary transition active:scale-95 dark:bg-blue-950/40 dark:text-blue-300"
            >
              <PhoneIcon className="h-5 w-5" />
            </a>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-red-50/80 p-3 dark:bg-red-950/25">
            <p className="text-[11px] font-semibold text-red-600 dark:text-red-300">الدين المتبقي</p>
            <p className="mt-1 text-base font-black tabular-nums text-red-700 dark:text-red-200 sm:text-lg">{money(store.totalDebt)}</p>
          </div>
          <div className="rounded-2xl bg-emerald-50/80 p-3 dark:bg-emerald-950/25">
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-300">المبلغ المحصّل</p>
            <p className="mt-1 text-base font-black tabular-nums text-emerald-700 dark:text-emerald-200 sm:text-lg">{money(store.totalCollected)}</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-[11px] font-semibold">
            <span className="text-slate-500 dark:text-slate-400">نسبة التحصيل</span>
            <span className="text-slate-800 dark:text-slate-200">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full rounded-full bg-success transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40 sm:px-5">
        <p className="flex min-w-0 items-center gap-1 truncate text-[11px] text-slate-500 dark:text-slate-400">
          <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
          {[store.region, store.address].filter(Boolean).join('، ') || 'لم يحدد العنوان'}
        </p>
        <div className="text-left text-[11px] text-slate-500 dark:text-slate-400">
          <p>{store.activeInvoices} فاتورة نشطة</p>
          {store.collectionPeriodDays && <p>مدة التحصيل {store.collectionPeriodDays} يوم</p>}
        </div>
      </div>

      {attachedInvoice && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            openAttachedInvoice();
          }}
          className="flex w-full items-center justify-between gap-3 border-t border-blue-100 bg-blue-50/80 px-4 py-3 text-right text-primary transition hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-950/50 sm:px-5"
        >
          <span className="flex items-center gap-2 text-xs font-extrabold">
            <DocumentTextIcon className="h-4 w-4" />
            عرض آخر فاتورة مرفقة
          </span>
          <span className="text-[10px] font-semibold opacity-75">{attachedInvoice.invoiceNumber}</span>
        </button>
      )}
    </article>
  );
};

const CollectionsTab = ({ collection, selectedMonth, currentMonth, onMonthChange, isFetching }) => {
  const monthLabel = new Intl.DateTimeFormat('ar-LY', { month: 'long', year: 'numeric' }).format(
    new Date(`${collection.selectedMonth || selectedMonth}-01T12:00:00`)
  );

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <label className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
          <CalendarDaysIcon className="h-4 w-4 text-primary" />
          اختر شهر التحصيل
        </label>
        <input
          type="month"
          value={collection.selectedMonth || selectedMonth}
          max={currentMonth}
          disabled={!collection.canViewPreviousMonths}
          onChange={(event) => onMonthChange(event.target.value)}
          className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none focus:border-primary focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
        />
        {!collection.canViewPreviousMonths && (
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">صلاحيتك تسمح بعرض الشهر الحالي فقط</p>
        )}
      </div>

      <div className={`grid gap-3 ${collection.canViewCommission ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <div className="relative overflow-hidden rounded-3xl bg-emerald-600 p-4 text-white shadow-lg shadow-emerald-600/15">
          <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-white/10" />
          <div className="relative">
            <p className="text-[11px] font-medium text-emerald-100">المحصّل في {monthLabel}</p>
            <p className="mt-2 text-xl font-black tabular-nums sm:text-2xl">{money(collection.totalCollected)}</p>
            <p className="mt-2 text-[10px] text-emerald-100">{collection.operationsCount || 0} عملية تحصيل</p>
          </div>
        </div>

        {collection.canViewCommission && (
          <div className="relative overflow-hidden rounded-3xl bg-blue-600 p-4 text-white shadow-lg shadow-blue-600/15">
            <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-white/10" />
            <div className="relative">
              <p className="text-[11px] font-medium text-blue-100">عمولتك</p>
              <p className="mt-2 text-xl font-black tabular-nums sm:text-2xl">{money(collection.commissionAmount)}</p>
              <p className="mt-2 text-[10px] text-blue-100">بنسبة {currency(collection.commissionRate)}%</p>
            </div>
          </div>
        )}
      </div>

      {isFetching && <div className="h-1 animate-pulse rounded-full bg-primary/50" />}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-950 dark:text-white">التحصيل حسب المحل</h2>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{collection.byStore?.length || 0} محل</span>
        </div>

        {collection.byStore?.length > 0 ? (
          <div className="space-y-3">
            {collection.byStore.map((store) => (
              <article key={store._id} className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 font-black text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {store.storeName?.trim().charAt(0) || <BuildingStorefrontIcon className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-extrabold text-slate-900 dark:text-white">{store.storeName}</h3>
                    {store.phone && <p className="mt-0.5 text-xs text-slate-500" dir="ltr">{store.phone}</p>}
                    <p className="mt-1 text-[10px] text-slate-400">{store.operationsCount} عملية</p>
                  </div>
                </div>
                <p className="shrink-0 text-base font-black tabular-nums text-emerald-600 dark:text-emerald-300">{money(store.totalCollected)}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
            <BanknotesIcon className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">لا يوجد تحصيل في هذا الشهر</p>
          </div>
        )}
      </div>
    </section>
  );
};

const SalesDashboardSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-44 rounded-[2rem]" />
    <Skeleton className="h-12" />
    <Skeleton className="h-72 rounded-3xl" />
    <Skeleton className="h-72 rounded-3xl" />
  </div>
);

export default function SalesDashboard({ user }) {
  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const [activeTab, setActiveTab] = useState('stores');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const dashboardQuery = useQuery({
    queryKey: ['dashboard', 'sales', selectedMonth],
    queryFn: () => dashboardApi.get({ month: selectedMonth })
  });
  const data = dashboardQuery.data;

  const stores = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('ar');
    return (data?.salesStores || []).filter((store) => {
      const matchesSearch = !query || [store.name, store.region, store.address, store.phone]
        .filter(Boolean)
        .some((value) => value.toLocaleLowerCase('ar').includes(query));
      const matchesFilter =
        filter === 'all' ||
        (filter === 'overdue' && store.totalDebt > 0 && store.daysRemaining < 0) ||
        (filter === 'active' && store.totalDebt > 0 && (store.daysRemaining === null || store.daysRemaining >= 0)) ||
        (filter === 'settled' && store.totalDebt <= 0);
      return matchesSearch && matchesFilter;
    });
  }, [data?.salesStores, filter, search]);

  if (dashboardQuery.isLoading) return <SalesDashboardSkeleton />;

  if (dashboardQuery.isError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-sm font-bold text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
        تعذر تحميل بيانات المحلات. حاول تحديث الصفحة.
      </div>
    );
  }

  const today = new Intl.DateTimeFormat('ar-LY', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  const salesCollection = data?.salesCollection || {};

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-xl shadow-slate-900/10 sm:p-6">
        <div className="absolute -left-10 -top-16 h-40 w-40 rounded-full bg-blue-500/30 blur-2xl" />
        <div className="absolute -bottom-20 right-0 h-44 w-44 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-medium text-blue-200">{today}</p>
          <div className="mt-1 flex items-end justify-between gap-3">
            <div>
              <h1 className="text-xl font-black sm:text-2xl">مرحباً، {user?.name?.split(' ')[0]}</h1>
              <p className="mt-1 text-xs text-slate-300">كل محلاتك وأرقام التحصيل في مكان واحد</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-2 text-center backdrop-blur">
              <p className="text-xl font-black">{data?.cards?.storesCount || 0}</p>
              <p className="text-[10px] text-slate-300">محل</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur">
              <p className="flex items-center gap-1.5 text-[11px] text-slate-300">
                <BanknotesIcon className="h-4 w-4 text-red-300" /> إجمالي الدين
              </p>
              <p className="mt-1.5 text-base font-black tabular-nums sm:text-lg">{money(data?.cards?.totalDebt)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur">
              <p className="flex items-center gap-1.5 text-[11px] text-slate-300">
                <CheckCircleIcon className="h-4 w-4 text-emerald-300" /> إجمالي المحصّل
              </p>
              <p className="mt-1.5 text-base font-black tabular-nums sm:text-lg">{money(data?.cards?.totalCollected)}</p>
            </div>
          </div>
        </div>
      </section>

      <nav className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => setActiveTab('stores')}
          className={`flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-extrabold transition ${
            activeTab === 'stores'
              ? 'bg-primary text-white shadow-md shadow-blue-600/20'
              : 'text-slate-500 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <BuildingStorefrontIcon className="h-5 w-5" />
          محلاتي
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('collections')}
          className={`flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-extrabold transition ${
            activeTab === 'collections'
              ? 'bg-primary text-white shadow-md shadow-blue-600/20'
              : 'text-slate-500 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <BanknotesIcon className="h-5 w-5" />
          التحصيل
        </button>
      </nav>

      {activeTab === 'stores' ? (
        <>
      <section className="space-y-3">
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ابحث عن محل أو منطقة..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pr-12 pl-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-950"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filters.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                filter === item.key
                  ? 'bg-primary text-white shadow-md shadow-blue-600/20'
                  : 'border border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-950 dark:text-white">المحلات</h2>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{stores.length} نتيجة</span>
        </div>

        {stores.length > 0 ? (
          <div className="space-y-4">
            {stores.map((store) => <StoreCard key={store._id} store={store} />)}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
            <DocumentTextIcon className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">لا توجد محلات مطابقة</p>
            <p className="mt-1 text-xs text-slate-500">غيّر البحث أو الفلتر لعرض النتائج</p>
          </div>
        )}
      </section>
        </>
      ) : (
        <CollectionsTab
          collection={salesCollection}
          selectedMonth={selectedMonth}
          currentMonth={currentMonth}
          onMonthChange={setSelectedMonth}
          isFetching={dashboardQuery.isFetching}
        />
      )}
    </div>
  );
}
