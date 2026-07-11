export const Switch = ({ label, checked, onChange, description }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right dark:border-slate-700 dark:bg-slate-900"
  >
    <span>
      <span className="block text-sm font-semibold text-slate-900 dark:text-slate-50">{label}</span>
      {description ? <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{description}</span> : null}
    </span>
    <span
      className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'right-0.5' : 'left-0.5'}`}
      />
    </span>
  </button>
);
