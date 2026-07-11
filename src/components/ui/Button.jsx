import { cn } from '../../utils/cn.js';

const variants = {
  primary: 'bg-primary text-white hover:bg-blue-700',
  secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100',
  success: 'bg-success text-white hover:bg-green-700',
  danger: 'bg-danger text-white hover:bg-red-700',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
};

export const Button = ({ className, variant = 'primary', as: Component = 'button', ...props }) => (
  <Component
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60',
      variants[variant],
      className
    )}
    {...props}
  />
);
