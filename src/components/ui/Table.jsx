export const Table = ({ columns, data, renderRow, emptyMessage = 'لا توجد بيانات' }) => (
  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-950">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-right dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {data.length ? (
            data.map((row, index) => renderRow(row, index))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-5 py-14 text-center text-sm text-slate-500 dark:text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
