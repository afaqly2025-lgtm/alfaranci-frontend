import { forwardRef } from 'react';
import { cn } from '../../utils/cn.js';

export const Textarea = forwardRef(({ className, label, error, ...props }, ref) => (
  <label className="block space-y-2">
    {label ? <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span> : null}
    <textarea
      ref={ref}
      className={cn(
        'min-h-28 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
        error && 'border-danger focus:border-danger focus:ring-danger/20',
        className
      )}
      {...props}
    />
    {error ? <p className="text-xs text-danger">{error}</p> : null}
  </label>
));

Textarea.displayName = 'Textarea';
