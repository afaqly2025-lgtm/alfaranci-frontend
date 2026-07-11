export const PageHeader = ({ title, description, action }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div>
      <h1 className="text-3xl font-black text-slate-900 dark:text-white">{title}</h1>
      {description ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
    </div>
    {action}
  </div>
);
