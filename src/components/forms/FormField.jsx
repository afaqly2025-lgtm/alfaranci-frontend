export const FormField = ({ label, children, error }) => (
  <label className="block space-y-2">
    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
    {children}
    {error ? <span className="text-xs text-danger">{error}</span> : null}
  </label>
);
