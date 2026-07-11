import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BanknotesIcon } from '@heroicons/react/24/outline';
import { invoicesApi } from '../../api/resources.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { Table } from '../../components/ui/Table.jsx';
import { CollectionConfirmationModal } from '../../components/collections/CollectionConfirmationModal.jsx';
import { currency, datetime } from '../../utils/format.js';
import toast from 'react-hot-toast';

export default function CollectionsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [pendingCollection, setPendingCollection] = useState(null);

  const listQuery = useQuery({
    queryKey: ['collections', page],
    queryFn: () => invoicesApi.collections({ page, limit: 10 })
  });

  const invoicesQuery = useQuery({
    queryKey: ['collection-invoices'],
    queryFn: () => invoicesApi.list({ page: 1, limit: 200 }),
    enabled: user?.role === 'Admin'
  });

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      invoiceId: '',
      amountCollected: '',
      collectionDate: new Date().toISOString().slice(0, 10),
      notes: ''
    }
  });
  const selectedInvoiceId = watch('invoiceId');
  const selectedInvoice = (invoicesQuery.data?.data || []).find((item) => item._id === selectedInvoiceId);

  const mutation = useMutation({
    mutationFn: (values) => invoicesApi.recordCollection(values),
    onSuccess: async () => {
      toast.success('تم تسجيل التحصيل');
      setOpen(false);
      setPendingCollection(null);
      reset();
      await queryClient.invalidateQueries({ queryKey: ['collections'] });
      await queryClient.invalidateQueries({ queryKey: ['invoices'] });
      await queryClient.invalidateQueries({ queryKey: ['collection-invoices'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'فشل تسجيل التحصيل')
  });

  const requestConfirmation = (values) => {
    const invoice = (invoicesQuery.data?.data || []).find((item) => item._id === values.invoiceId);
    if (!invoice) {
      toast.error('يرجى اختيار فاتورة صحيحة');
      return;
    }
    if (Number(values.amountCollected) > Number(invoice.remainingAmount)) {
      toast.error(`المبلغ أكبر من الرصيد المتبقي: ${currency(invoice.remainingAmount)} د.ل`);
      return;
    }
    setPendingCollection({
      ...values,
      storeName: invoice.storeName || 'غير محدد',
      invoiceNumber: invoice.invoiceNumber || '',
      remainingAmount: invoice.remainingAmount
    });
    setOpen(false);
  };

  const cancelConfirmation = () => {
    setPendingCollection(null);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="عمليات التحصيل"
        description="كل عملية تحصيل تسجل بشكل مستقل مع خصم الرصيد تلقائياً."
        action={user?.role === 'Admin' ? (
          <Button onClick={() => setOpen(true)}>
            <BanknotesIcon className="h-4 w-4" />
            تحصيل جديد
          </Button>
        ) : null}
      />

      <Table
        columns={['الفاتورة', 'المبلغ', 'التاريخ', 'المندوب', 'سجلها', 'ملاحظات']}
        data={listQuery.data?.data || []}
        renderRow={(row) => (
          <tr key={row._id}>
            <td className="px-5 py-4 font-semibold">{row.invoice?.invoiceNumber}</td>
            <td className="px-5 py-4">{currency(row.amountCollected)}</td>
            <td className="px-5 py-4">{datetime(row.collectionDate)}</td>
            <td className="px-5 py-4 font-semibold">{row.salesRep?.name || row.invoice?.salesRepName || '-'}</td>
            <td className="px-5 py-4">{row.recordedBy?.name}</td>
            <td className="px-5 py-4">{row.notes || '-'}</td>
          </tr>
        )}
      />

      <Pagination meta={listQuery.data?.meta} onPageChange={setPage} />

      <Modal open={open} onClose={() => setOpen(false)} title="تسجيل تحصيل" size="lg">
        <form onSubmit={handleSubmit(requestConfirmation)} className="grid gap-4 md:grid-cols-2">
          <Select label="الفاتورة" {...register('invoiceId', { required: 'الفاتورة مطلوبة' })} error={errors.invoiceId?.message}>
            <option value="">اختر الفاتورة</option>
            {(invoicesQuery.data?.data || []).map((invoice) => (
              <option key={invoice._id} value={invoice._id}>
                {invoice.invoiceNumber} - {invoice.storeName}
              </option>
            ))}
          </Select>
          <Input label="المبلغ المحصل" type="number" min="0.01" max={selectedInvoice?.remainingAmount} step="0.01" {...register('amountCollected', { required: 'المبلغ مطلوب', min: { value: 0.01, message: 'المبلغ يجب أن يكون أكبر من صفر' }, valueAsNumber: true })} error={errors.amountCollected?.message} />
          {selectedInvoice && (
            <p className="self-end rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-primary dark:bg-blue-950/30 dark:text-blue-300">
              الرصيد المتبقي: {currency(selectedInvoice.remainingAmount)} د.ل
            </p>
          )}
          <Input label="تاريخ التحصيل" type="date" {...register('collectionDate')} />
          <Input label="ملاحظات" {...register('notes')} />
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={mutation.isPending}>حفظ</Button>
          </div>
        </form>
      </Modal>

      <CollectionConfirmationModal
        collection={pendingCollection}
        isPending={mutation.isPending}
        onCancel={cancelConfirmation}
        onConfirm={() => mutation.mutate(pendingCollection)}
      />
    </div>
  );
}
