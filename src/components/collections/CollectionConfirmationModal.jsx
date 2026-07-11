import { BanknotesIcon, BuildingStorefrontIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { currency } from '../../utils/format.js';

export const CollectionConfirmationModal = ({ collection, isPending, onCancel, onConfirm }) => (
  <Modal open={Boolean(collection)} onClose={onCancel} title="تأكيد عملية التحصيل" size="sm" layer="z-[60]">
    {collection && (
      <div className="space-y-5">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-amber-50 text-warning dark:bg-amber-950/30">
          <ExclamationTriangleIcon className="h-8 w-8" />
        </div>

        <div className="text-center">
          <h3 className="text-lg font-black text-slate-950 dark:text-white">هل أنت متأكد؟</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">سيتم خصم المبلغ من رصيد الفاتورة بعد التأكيد.</p>
        </div>

        <div className="space-y-3 rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <BuildingStorefrontIcon className="h-4 w-4" /> اسم المحل
            </span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">{collection.storeName}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <BanknotesIcon className="h-4 w-4" /> المبلغ المحصّل
            </span>
            <span className="text-lg font-black text-success">{currency(collection.amountCollected)} د.ل</span>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-3 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">الرصيد قبل التحصيل</span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{currency(collection.remainingAmount)} د.ل</span>
          </div>
          {collection.invoiceNumber && (
            <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-3 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">رقم الفاتورة</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{collection.invoiceNumber}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>رجوع</Button>
          <Button type="button" variant="success" onClick={onConfirm} disabled={isPending}>
            {isPending ? 'جارٍ الحفظ...' : 'نعم، تأكيد'}
          </Button>
        </div>
      </div>
    )}
  </Modal>
);
