const styles = {
  New: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  'Partially Collected': 'bg-warning/15 text-warning',
  'Fully Collected': 'bg-success/15 text-success',
  Overdue: 'bg-danger/15 text-danger',
  Active: 'bg-success/15 text-success',
  Suspended: 'bg-danger/15 text-danger'
};

export const Badge = ({ children, tone, className = '' }) => (
  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${styles[tone] || 'bg-slate-100 text-slate-700'} ${className}`}>
    {children}
  </span>
);
