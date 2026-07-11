import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  EyeIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { invoicesApi, storesApi, usersApi } from '../../api/resources.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Textarea } from '../../components/ui/Textarea.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { Table } from '../../components/ui/Table.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { CollectionConfirmationModal } from '../../components/collections/CollectionConfirmationModal.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import { currency, date, datetime } from '../../utils/format.js';
import { statusLabel } from '../../utils/status.js';
import { apiAssetUrl } from '../../config/api.js';
import toast from 'react-hot-toast';

const emptyInvoice = {
  invoiceNumber: '',
  storeId: '',
  salesRepId: '',
  invoiceDate: new Date().toISOString().slice(0, 10),
  totalAmount: '',
  notes: ''
};

function CollectionRecorder({ invoiceId, invoiceNumber, storeName, remainingAmount, onSuccess }) {
  const [pendingCollection, setPendingCollection] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      amountCollected: '',
      collectionDate: new Date().toISOString().slice(0, 10),
      notes: ''
    }
  });

  const mutation = useMutation({
    mutationFn: (values) => invoicesApi.recordCollection({ ...values, invoiceId }),
    onSuccess: async () => {
      toast.success('تم تسجيل التحصيل');
      setPendingCollection(null);
      reset();
      await onSuccess?.();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'فشل تسجيل التحصيل')
  });

  const requestConfirmation = (values) => {
    if (Number(values.amountCollected) > Number(remainingAmount)) {
      toast.error(`المبلغ أكبر من الرصيد المتبقي: ${currency(remainingAmount)} د.ل`);
      return;
    }
    setPendingCollection({ ...values, invoiceId, invoiceNumber, storeName, remainingAmount });
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(requestConfirmation)}
        className="grid gap-4 md:grid-cols-3"
      >
        <Input label="المبلغ المحصل" type="number" min="0.01" max={remainingAmount} step="0.01" {...register('amountCollected', { required: 'المبلغ مطلوب', min: { value: 0.01, message: 'المبلغ يجب أن يكون أكبر من صفر' }, max: { value: remainingAmount, message: `الحد الأقصى ${currency(remainingAmount)} د.ل` }, valueAsNumber: true })} error={errors.amountCollected?.message} />
        <Input label="تاريخ التحصيل" type="date" {...register('collectionDate')} />
        <Input label="ملاحظات" {...register('notes')} />
        <div className="md:col-span-3 flex justify-end">
          <Button type="submit" className="px-6" disabled={mutation.isPending}>
            <BanknotesIcon className="h-4 w-4" />
            تسجيل التحصيل
          </Button>
        </div>
      </form>

      <CollectionConfirmationModal
        collection={pendingCollection}
        isPending={mutation.isPending}
        onCancel={() => setPendingCollection(null)}
        onConfirm={() => mutation.mutate(pendingCollection)}
      />
    </>
  );
}

export default function InvoicesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const debouncedSearch = useDebounce(search);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  const listQuery = useQuery({
    queryKey: ['invoices', { page, debouncedSearch, status }],
    queryFn: () => invoicesApi.list({ page, limit: 10, q: debouncedSearch, status })
  });

  const storesQuery = useQuery({
    queryKey: ['invoice-stores'],
    queryFn: () => storesApi.list({ page: 1, limit: 200 })
  });

  const usersQuery = useQuery({
    queryKey: ['invoice-sales-users'],
    queryFn: () => usersApi.list({ page: 1, limit: 200 }),
    enabled: user?.role === 'Admin'
  });

  const detailQuery = useQuery({
    queryKey: ['invoice-detail', selectedInvoiceId],
    queryFn: () => invoicesApi.get(selectedInvoiceId),
    enabled: Boolean(selectedInvoiceId)
  });

  const createMutation = useMutation({
    mutationFn: async (values) => {
      if (editing) return invoicesApi.update(editing._id, values);
      return invoicesApi.create(values);
    },
    onSuccess: async () => {
      toast.success(editing ? 'تم تحديث الفاتورة' : 'تمت إضافة الفاتورة');
      setOpen(false);
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'فشل حفظ الفاتورة')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => invoicesApi.remove(id),
    onSuccess: async () => {
      toast.success('تم حذف الفاتورة');
      await queryClient.invalidateQueries({ queryKey: ['invoices'] });
    }
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: emptyInvoice
  });

  useEffect(() => {
    if (editing) {
      reset({
        invoiceNumber: editing.invoiceNumber,
        storeId: editing.store?._id || editing.store || '',
        salesRepId: editing.salesRep?._id || editing.salesRep || '',
        invoiceDate: editing.invoiceDate ? new Date(editing.invoiceDate).toISOString().slice(0, 10) : '',
        totalAmount: editing.totalAmount,
        notes: editing.notes || ''
      });
    } else {
      reset(emptyInvoice);
    }
  }, [editing, reset]);

  const stores = storesQuery.data?.data || [];
  const salesUsers = useMemo(
    () => (usersQuery.data?.data || []).filter((item) => item.role === 'Sales'),
    [usersQuery.data]
  );

  const detail = detailQuery.data?.invoice;
  const collections = detailQuery.data?.collections || [];

  const openEditor = (row = null) => {
    setEditing(row);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة الفواتير"
        description="إضافة وتعديل الفواتير، ورفع ملفات PDF أو الصور المرتبطة بها."
        action={
          user?.role === 'Admin' ? (
            <Button onClick={() => openEditor(null)}>
              <PlusIcon className="h-4 w-4" />
              فاتورة جديدة
            </Button>
          ) : null
        }
      />

      <div className="flex flex-wrap gap-3">
        <Input value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} placeholder="بحث برقم الفاتورة أو المحل..." className="max-w-md" />
        <Select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }} className="max-w-56">
          <option value="">كل الحالات</option>
          <option value="New">جديدة</option>
          <option value="Partially Collected">محصلة جزئياً</option>
          <option value="Fully Collected">محصلة بالكامل</option>
          <option value="Overdue">متأخرة</option>
        </Select>
      </div>

      <Table
        columns={['رقم الفاتورة', 'المحل', 'المندوب', 'الإجمالي', 'المتبقي', 'الاستحقاق', 'الحالة', 'الإجراءات']}
        data={listQuery.data?.data || []}
        renderRow={(row) => (
          <tr key={row._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60">
            <td className="px-5 py-4 font-semibold">{row.invoiceNumber}</td>
            <td className="px-5 py-4">{row.storeName}</td>
            <td className="px-5 py-4">{row.salesRepName}</td>
            <td className="px-5 py-4">{currency(row.totalAmount)}</td>
            <td className="px-5 py-4">{currency(row.remainingAmount)}</td>
            <td className="px-5 py-4">{date(row.dueDate)}</td>
            <td className="px-5 py-4"><Badge tone={row.status}>{statusLabel(row.status)}</Badge></td>
            <td className="px-5 py-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setSelectedInvoiceId(row._id)}>
                  <EyeIcon className="h-4 w-4" />
                </Button>
                {user?.role === 'Admin' ? (
                  <>
                    <Button variant="secondary" onClick={() => openEditor(row)}>
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="danger" onClick={() => window.confirm('حذف الفاتورة؟') && deleteMutation.mutate(row._id)}>
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </>
                ) : null}
              </div>
            </td>
          </tr>
        )}
      />

      <Pagination meta={listQuery.data?.meta} onPageChange={setPage} />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'تعديل فاتورة' : 'إضافة فاتورة'} size="xl">
        <form onSubmit={handleSubmit((values) => {
          const pdfFile = values.pdfFile?.[0];
          createMutation.mutate({ ...values, pdfFile });
        })} className="grid gap-4 md:grid-cols-2">
          <Input label="رقم الفاتورة" {...register('invoiceNumber', { required: 'رقم الفاتورة مطلوب' })} error={errors.invoiceNumber?.message} />
          <Input label="تاريخ الفاتورة" type="date" {...register('invoiceDate', { required: 'تاريخ الفاتورة مطلوب' })} error={errors.invoiceDate?.message} />
          <Select label="اسم المحل" {...register('storeId', { required: 'المحل مطلوب' })} error={errors.storeId?.message}>
            <option value="">اختر المحل</option>
            {stores.map((store) => (
              <option key={store._id} value={store._id}>{store.name}</option>
            ))}
          </Select>
          <Select label="المندوب" {...register('salesRepId')}>
            <option value="">حسب المحل تلقائياً</option>
            {salesUsers.map((userItem) => (
              <option key={userItem._id} value={userItem._id}>{userItem.name}</option>
            ))}
          </Select>
          <Input label="قيمة الفاتورة" type="number" step="0.01" {...register('totalAmount', { required: 'القيمة مطلوبة', valueAsNumber: true })} error={errors.totalAmount?.message} />
          <Input label="ملف الفاتورة (PDF/JPG/PNG)" type="file" accept=".pdf,image/png,image/jpeg" {...register('pdfFile')} />
          <div className="md:col-span-2">
            <Textarea label="ملاحظات" {...register('notes')} />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'جارٍ الحفظ...' : 'حفظ'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(selectedInvoiceId)} onClose={() => setSelectedInvoiceId(null)} title="تفاصيل الفاتورة" size="xl">
        {detailQuery.isLoading ? (
          <div>جاري التحميل...</div>
        ) : detail ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-xs text-slate-500">رقم الفاتورة</p>
                <p className="mt-1 text-lg font-bold">{detail.invoiceNumber}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-xs text-slate-500">الإجمالي</p>
                <p className="mt-1 text-lg font-bold">{currency(detail.totalAmount)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-xs text-slate-500">المتبقي</p>
                <p className="mt-1 text-lg font-bold">{currency(detail.remainingAmount)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-xs text-slate-500">الحالة</p>
                <p className="mt-1 text-lg font-bold">{statusLabel(detail.status)}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {detail.pdfFile?.url ? (
                <Button as="a" href={apiAssetUrl(detail.pdfFile.url)} target="_blank" rel="noreferrer" variant="secondary">
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  عرض الفاتورة
                </Button>
              ) : null}
            </div>

            {user?.role === 'Admin' ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
                <h4 className="mb-4 text-lg font-bold">تسجيل تحصيل</h4>
                <CollectionRecorder
                  invoiceId={detail._id}
                  invoiceNumber={detail.invoiceNumber}
                  storeName={detail.storeName}
                  remainingAmount={detail.remainingAmount}
                  onSuccess={async () => {
                    await queryClient.invalidateQueries({ queryKey: ['invoices'] });
                    await queryClient.invalidateQueries({ queryKey: ['invoice-detail', selectedInvoiceId] });
                    await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
                  }}
                />
              </div>
            ) : null}

            <div>
              <h4 className="mb-3 text-lg font-bold">عمليات التحصيل</h4>
              <Table
                columns={['المبلغ', 'التاريخ', 'المستخدم', 'الملاحظات']}
                data={collections}
                renderRow={(entry) => (
                  <tr key={entry._id}>
                    <td className="px-5 py-4">{currency(entry.amountCollected)}</td>
                    <td className="px-5 py-4">{datetime(entry.collectionDate)}</td>
                    <td className="px-5 py-4">{entry.recordedBy?.name}</td>
                    <td className="px-5 py-4">{entry.notes || '-'}</td>
                  </tr>
                )}
              />
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
