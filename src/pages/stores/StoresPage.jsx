import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { storesApi, usersApi } from '../../api/resources.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Textarea } from '../../components/ui/Textarea.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { Table } from '../../components/ui/Table.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import toast from 'react-hot-toast';
import StoreProfileModal from './StoreProfileModal.jsx';

const emptyStore = {
  name: '',
  phone: '',
  region: '',
  address: '',
  assignedSalesRep: '',
  notes: ''
};

export default function StoresPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState(null);

  const listQuery = useQuery({
    queryKey: ['stores', { page, debouncedSearch }],
    queryFn: () => storesApi.list({ page, limit: 10, q: debouncedSearch })
  });

  const repsQuery = useQuery({
    queryKey: ['sales-users'],
    queryFn: () => usersApi.list({ page: 1, limit: 100, q: '', role: 'Sales' }),
    enabled: user?.role === 'Admin'
  });

  const mutation = useMutation({
    mutationFn: async (values) => {
      if (editing) return storesApi.update(editing._id, values);
      return storesApi.create(values);
    },
    onSuccess: async () => {
      toast.success(editing ? 'تم تحديث المحل' : 'تمت إضافة المحل');
      setOpen(false);
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'فشل حفظ المحل')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => storesApi.remove(id),
    onSuccess: async () => {
      toast.success('تم حذف المحل');
      await queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'فشل حذف المحل')
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({ defaultValues: emptyStore });

  useEffect(() => {
    if (editing) {
      reset({
        name: editing.name,
        phone: editing.phone || '',
        region: editing.region || '',
        address: editing.address || '',
        assignedSalesRep: editing.assignedSalesRep?._id || editing.assignedSalesRep || '',
        notes: editing.notes || ''
      });
    } else {
      reset(emptyStore);
    }
  }, [editing, reset]);

  const onSubmit = (values) => mutation.mutate(values);

  const salesUsers = (repsQuery.data?.data || []).filter((item) => item.role === 'Sales');

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة المحلات"
        description="عرض المحلات وربطها بالمندوب المسؤول."
        action={
          user?.role === 'Admin' ? (
            <Button onClick={() => { setEditing(null); setOpen(true); }}>
              <PlusIcon className="h-4 w-4" />
              محل جديد
            </Button>
          ) : null
        }
      />

      <Input value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} placeholder="بحث باسم المحل أو المنطقة..." className="max-w-md" />

      <Table
        columns={['الاسم', 'الهاتف', 'المنطقة', 'العنوان', 'المندوب', 'الملاحظات', 'الإجراءات']}
        data={listQuery.data?.data || []}
        renderRow={(row) => (
          <tr
            key={row._id}
            onClick={() => setSelectedStoreId(row._id)}
            className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60"
          >
            <td className="px-5 py-4 font-semibold">{row.name}</td>
            <td className="px-5 py-4">{row.phone || '-'}</td>
            <td className="px-5 py-4">{row.region || '-'}</td>
            <td className="px-5 py-4">{row.address || '-'}</td>
            <td className="px-5 py-4">{row.assignedSalesRep?.name || '-'}</td>
            <td className="px-5 py-4">{row.notes || '-'}</td>
            <td className="px-5 py-4">
              {user?.role === 'Admin' ? (
                <div className="flex gap-2" onClick={(event) => event.stopPropagation()}>
                  <Button variant="secondary" onClick={() => { setEditing(row); setOpen(true); }}>
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      if (window.confirm('هل تريد حذف المحل؟')) deleteMutation.mutate(row._id);
                    }}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                '-'
              )}
            </td>
          </tr>
        )}
      />

      <Pagination meta={listQuery.data?.meta} onPageChange={setPage} />

      <StoreProfileModal storeId={selectedStoreId} onClose={() => setSelectedStoreId(null)} />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'تعديل محل' : 'إضافة محل'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
          <Input label="اسم المحل" {...register('name', { required: 'اسم المحل مطلوب' })} error={errors.name?.message} />
          <Input label="رقم الهاتف" {...register('phone')} />
          <Input label="المنطقة" {...register('region')} />
          <Select label="المندوب المسؤول" {...register('assignedSalesRep', { required: 'المندوب مطلوب' })} error={errors.assignedSalesRep?.message}>
            <option value="">اختر المندوب</option>
            {salesUsers.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </Select>
          <div className="md:col-span-2">
            <Input label="العنوان" {...register('address')} />
          </div>
          <div className="md:col-span-2">
            <Textarea label="ملاحظات" {...register('notes')} />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'جارٍ الحفظ...' : 'حفظ'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
