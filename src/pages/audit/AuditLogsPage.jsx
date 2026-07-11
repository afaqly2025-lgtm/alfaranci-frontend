import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditLogsApi } from '../../api/resources.js';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { Table } from '../../components/ui/Table.jsx';
import { datetime } from '../../utils/format.js';

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ['audit-logs', page],
    queryFn: () => auditLogsApi.list({ page, limit: 10 })
  });

  return (
    <div className="space-y-6">
      <PageHeader title="سجل العمليات" description="توثيق عمليات الإضافة والتعديل والحذف وتسجيل الدخول والتحصيل." />

      <Table
        columns={['الوقت', 'المستخدم', 'نوع العملية', 'IP', 'البيانات']}
        data={query.data?.data || []}
        renderRow={(row) => (
          <tr key={row._id}>
            <td className="px-5 py-4">{datetime(row.createdAt)}</td>
            <td className="px-5 py-4">{row.user?.name || '-'}</td>
            <td className="px-5 py-4 font-semibold">{row.action}</td>
            <td className="px-5 py-4">{row.ipAddress || '-'}</td>
            <td className="px-5 py-4 text-sm text-slate-500">{JSON.stringify(row.metadata || {})}</td>
          </tr>
        )}
      />

      <Pagination meta={query.data?.meta} onPageChange={setPage} />
    </div>
  );
}
