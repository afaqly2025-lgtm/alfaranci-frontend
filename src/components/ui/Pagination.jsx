import { Button } from './Button.jsx';

export const Pagination = ({ meta, onPageChange }) => {
  if (!meta || meta.pages <= 1) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950">
      <span className="text-slate-500 dark:text-slate-400">
        صفحة {meta.page} من {meta.pages}
      </span>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => onPageChange(Math.max(meta.page - 1, 1))} disabled={meta.page === 1}>
          السابق
        </Button>
        <Button variant="secondary" onClick={() => onPageChange(Math.min(meta.page + 1, meta.pages))} disabled={meta.page === meta.pages}>
          التالي
        </Button>
      </div>
    </div>
  );
};
