import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BellAlertIcon, BellIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { notificationsApi } from '../../api/resources.js';
import { datetime } from '../../utils/format.js';

const typeClasses = {
  INVOICE_CREATED: 'bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/50',
  INVOICE_UPDATED: 'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/50',
  INVOICE_ASSIGNED: 'bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/50',
  INVOICE_REASSIGNED: 'bg-red-50 text-red-700 ring-red-100 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900/50',
  INVOICE_DELETED: 'bg-red-50 text-red-700 ring-red-100 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900/50',
  COLLECTION_RECORDED: 'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/50'
};

const notificationTone = (type) => typeClasses[type] || typeClasses.INVOICE_UPDATED;

const NotificationsDrawer = ({
  items,
  unreadCount,
  isLoading,
  onClose,
  markRead,
  markAllRead,
  isMarkingAll
}) => (
  <section
    dir="rtl"
    className="notification-drawer fixed inset-0 z-[70] flex flex-col overflow-hidden bg-slate-50 text-right text-slate-950 shadow-2xl dark:bg-slate-950 dark:text-white"
  >
    <header className="relative shrink-0 overflow-hidden bg-slate-950 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] text-white">
      <div className="absolute -left-12 -top-12 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl" />
      <div className="absolute -bottom-16 right-6 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative mx-auto flex max-w-2xl items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-xl font-black">إشعاراتك</h3>
          <p className="mt-1 text-[11px] leading-5 text-slate-300">
            إشعارات بإضافة أو تعديل الفواتير وتسجيل التحصيلات الجديدة
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق نافذة الإشعارات"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/10 text-white ring-1 ring-white/10 backdrop-blur transition active:scale-95"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="relative mx-auto mt-3 grid max-w-2xl grid-cols-2 gap-2">
        <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
          <p className="text-[10px] text-slate-300">غير مقروء</p>
          <p className="mt-0.5 text-2xl font-black">{unreadCount}</p>
        </div>
        <button
          type="button"
          disabled={unreadCount === 0 || isMarkingAll}
          onClick={markAllRead}
          className="rounded-2xl bg-white p-3 text-right text-slate-950 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="block text-xs font-black">تعليم الكل كمقروء</span>
        </button>
      </div>
    </header>

    <main className="flex-1 overflow-y-auto px-3 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
      {isLoading ? (
        <div className="mx-auto max-w-2xl space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-3xl bg-white dark:bg-slate-900" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="mx-auto max-w-2xl space-y-3">
          {items.map((item) => {
            const unread = !item.readAt;

            return (
              <button
                key={item._id}
                type="button"
                onClick={() => {
                  if (unread) markRead(item._id);
                }}
                className={`w-full rounded-3xl border p-3.5 text-right shadow-sm transition active:scale-[0.99] ${
                  unread
                    ? 'border-blue-200 bg-white ring-2 ring-blue-100 dark:border-blue-900/70 dark:bg-slate-900 dark:ring-blue-950/70'
                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ring-1 ${notificationTone(item.type)}`}>
                    {unread ? <BellAlertIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-black text-slate-950 dark:text-white">{item.title}</span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black ${
                          unread ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {unread ? 'جديد' : 'مقروء'}
                      </span>
                    </span>

                    <span className="mt-2 block text-xs leading-6 text-slate-700 dark:text-slate-300">{item.message}</span>

                    {(item.invoiceNumber || item.storeName || item.repeatCount > 1) && (
                      <span className="mt-3 flex flex-wrap gap-1.5">
                        {item.invoiceNumber && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            فاتورة {item.invoiceNumber}
                          </span>
                        )}
                        {item.storeName && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {item.storeName}
                          </span>
                        )}
                        {item.repeatCount > 1 && (
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                            تكرر {item.repeatCount} مرات
                          </span>
                        )}
                      </span>
                    )}

                    <span className="mt-3 block text-[10px] font-semibold text-slate-400">{datetime(item.lastOccurredAt)}</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mx-auto max-w-2xl rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center dark:border-slate-700 dark:bg-slate-900">
          <BellIcon className="mx-auto h-11 w-11 text-slate-300 dark:text-slate-700" />
          <p className="mt-3 text-sm font-black text-slate-800 dark:text-slate-100">لا توجد إشعارات الآن</p>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            أي تعديل جديد على فواتيرك من مدير النظام سيظهر هنا بشكل مرتب.
          </p>
        </div>
      )}
    </main>
  </section>
);

export const SalesNotifications = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ['notifications', 'sales'],
    queryFn: () => notificationsApi.list({ limit: 12 }),
    refetchInterval: 30000
  });

  const markReadMutation = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', 'sales'] })
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', 'sales'] })
  });

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const items = notificationsQuery.data?.items || [];
  const unreadCount = notificationsQuery.data?.unreadCount || 0;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="الإشعارات"
        className="relative grid h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        {unreadCount > 0 ? <BellAlertIcon className="h-5 w-5 text-danger" /> : <BellIcon className="h-5 w-5" />}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-danger px-1 text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-950">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open &&
        createPortal(
          <NotificationsDrawer
            items={items}
            unreadCount={unreadCount}
            isLoading={notificationsQuery.isLoading}
            onClose={() => setOpen(false)}
            markRead={(id) => markReadMutation.mutate(id)}
            markAllRead={() => markAllReadMutation.mutate()}
            isMarkingAll={markAllReadMutation.isPending}
          />,
          document.body
        )}
    </div>
  );
};
