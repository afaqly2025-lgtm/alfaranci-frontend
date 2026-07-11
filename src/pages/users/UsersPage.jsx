import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { usersApi } from '../../api/resources.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Switch } from '../../components/ui/Switch.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { Table } from '../../components/ui/Table.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import toast from 'react-hot-toast';
import { statusLabel } from '../../utils/status.js';

const emptyUser = {
  name: '',
  username: '',
  password: '',
  role: 'Sales',
  commissionRate: 0,
  canViewCommission: false,
  canViewPreviousMonths: false,
  status: 'Active'
};

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const listQuery = useQuery({
    queryKey: ['users', { page, debouncedSearch }],
    queryFn: () => usersApi.list({ page, limit: 10, q: debouncedSearch })
  });

  const mutation = useMutation({
    mutationFn: async (values) => {
      if (editing) return usersApi.update(editing._id, values);
      return usersApi.create(values);
    },
    onSuccess: async () => {
      toast.success(editing ? 'تم تحديث المستخدم' : 'تمت إضافة المستخدم');
      setOpen(false);
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'فشل حفظ المستخدم')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => usersApi.remove(id),
    onSuccess: async () => {
      toast.success('تم حذف المستخدم');
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'فشل حذف المستخدم')
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: emptyUser
  });
  const passwordRules = editing ? {} : { required: 'كلمة المرور مطلوبة', minLength: { value: 6, message: 'كلمة المرور قصيرة جداً' } };

  useEffect(() => {
    if (editing) {
      reset({
        name: editing.name,
        username: editing.username,
        password: '',
        role: editing.role,
        commissionRate: editing.commissionRate,
        canViewCommission: editing.canViewCommission,
        canViewPreviousMonths: editing.canViewPreviousMonths,
        status: editing.status
      });
    } else {
      reset(emptyUser);
    }
  }, [editing, reset]);

  const onSubmit = (values) => {
    const payload = { ...values };
    if (editing && !payload.password) delete payload.password;
    mutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة المستخدمين"
        description="إضافة وتعديل حسابات المدير والمندوبين."
        action={
          <Button onClick={() => { setEditing(null); setOpen(true); }}>
            <PlusIcon className="h-4 w-4" />
            مستخدم جديد
          </Button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <Input value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} placeholder="بحث بالاسم أو اسم المستخدم..." className="max-w-md" />
      </div>

      <Table
        columns={['الاسم', 'اسم المستخدم', 'الدور', 'العمولة', 'الرؤية', 'الحالة', 'الإجراءات']}
        data={listQuery.data?.data || []}
        renderRow={(row) => (
          <tr key={row._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60">
            <td className="px-5 py-4 font-semibold">{row.name}</td>
            <td className="px-5 py-4">{row.username}</td>
            <td className="px-5 py-4">{row.role}</td>
            <td className="px-5 py-4">{row.commissionRate}%</td>
            <td className="px-5 py-4">{row.canViewCommission ? 'نعم' : 'لا'}</td>
            <td className="px-5 py-4">{statusLabel(row.status)}</td>
            <td className="px-5 py-4">
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => { setEditing(row); setOpen(true); }}>
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    if (window.confirm('هل تريد حذف المستخدم؟')) deleteMutation.mutate(row._id);
                  }}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </td>
          </tr>
        )}
      />

      <Pagination meta={listQuery.data?.meta} onPageChange={setPage} />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'تعديل مستخدم' : 'إضافة مستخدم'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
          <Input label="الاسم" {...register('name', { required: 'الاسم مطلوب' })} error={errors.name?.message} />
          <Input label="اسم المستخدم" {...register('username', { required: 'اسم المستخدم مطلوب' })} error={errors.username?.message} />
          <Input type="password" label="كلمة المرور" {...register('password', passwordRules)} error={errors.password?.message} />
          <Select label="الدور" {...register('role')}>
            <option value="Admin">Admin</option>
            <option value="Sales">Sales</option>
          </Select>
          <Input type="number" step="0.01" label="نسبة العمولة" {...register('commissionRate', { valueAsNumber: true })} />
          <Select label="الحالة" {...register('status')}>
            <option value="Active">فعال</option>
            <option value="Suspended">موقوف</option>
          </Select>
          <Switch label="إمكانية رؤية العمولة" checked={watch('canViewCommission')} onChange={(value) => setValue('canViewCommission', value)} />
          <Switch label="إمكانية رؤية الأشهر السابقة" checked={watch('canViewPreviousMonths')} onChange={(value) => setValue('canViewPreviousMonths', value)} />
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
