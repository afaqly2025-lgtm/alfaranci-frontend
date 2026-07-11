import { forwardRef } from 'react';
import { cn } from '../../utils/cn.js';

export const Select = forwardRef(({ className, label, error, children, ...props }, ref) => (
  <label className="block space-y-2">
    {label ? <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span> : null}
    <select
      ref={ref}
      className={cn(
        'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
        error && 'border-danger focus:border-danger focus:ring-danger/20',
        className
      )}
      {...props}
    >
      {children}
    </select>
    {error ? <p className="text-xs text-danger">{error}</p> : null}
  </label>
));

Select.displayName = 'Select';
