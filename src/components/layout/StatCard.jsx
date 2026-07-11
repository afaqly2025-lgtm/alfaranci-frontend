export const StatCard = ({ label, value, icon, accent = 'primary', hint }) => {
  const accents = {
    primary: 'from-blue-500 to-blue-600',
    success: 'from-green-500 to-green-600',
    warning: 'from-amber-500 to-amber-600',
    danger: 'from-red-500 to-red-600',
    slate: 'from-slate-600 to-slate-700'
  };

  return (
    <div className="rounded-3xl border border-white/60 bg-white/90 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <h3 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">{value}</h3>
          {hint ? <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accents[accent] || accents.primary} text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
