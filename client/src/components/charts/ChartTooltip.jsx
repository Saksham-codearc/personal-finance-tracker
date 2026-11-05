import { formatCurrency } from '../../lib/format';

export default function ChartTooltip({ active, payload, label, showLabel = true }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="chart-tooltip">
      {showLabel && label && (
        <p className="mb-1.5 font-semibold text-slate-700 dark:text-slate-200">{label}</p>
      )}
      <div className="space-y-1">
        {payload.map((item) => (
          <div key={item.dataKey || item.name} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color || item.payload?.fill }}
            />
            <span className="capitalize text-slate-500 dark:text-slate-400">{item.name}</span>
            <span className="ml-auto font-semibold tabular-nums text-slate-800 dark:text-slate-100">
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
