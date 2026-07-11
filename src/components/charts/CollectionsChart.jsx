const height = 260;
const padding = 24;

export const CollectionsChart = ({ data }) => {
  const values = data?.length ? data.map((item) => Number(item.total || 0)) : [0];
  const max = Math.max(...values, 1);
  const width = 900;
  const barWidth = Math.max((width - padding * 2) / Math.max(data?.length || 1, 1) - 16, 20);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-950">
      <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">التحصيل الشهري</h3>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-w-full">
          {[0, 25, 50, 75, 100].map((tick) => {
            const y = padding + (height - padding * 2) * (1 - tick / 100);
            return (
              <g key={tick}>
                <line x1={padding} x2={width - padding} y1={y} y2={y} stroke="rgba(148,163,184,0.16)" />
              </g>
            );
          })}
          {(data || []).map((item, index) => {
            const value = Number(item.total || 0);
            const barHeight = ((height - padding * 2) * value) / max;
            const x = padding + index * (barWidth + 16);
            const y = height - padding - barHeight;
            return (
              <g key={item.label || index}>
                <rect x={x} y={y} width={barWidth} height={barHeight} rx="16" fill="#2563EB" />
                <text x={x + barWidth / 2} y={height - 8} textAnchor="middle" fontSize="12" fill="currentColor" className="text-slate-500">
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
