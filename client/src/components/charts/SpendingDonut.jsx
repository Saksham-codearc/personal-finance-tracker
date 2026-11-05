import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '../../lib/format';
import { getCategoryMeta } from '../../lib/categories';
import CategoryIcon from '../transactions/CategoryIcon';
import ChartTooltip from './ChartTooltip';

export default function SpendingDonut({ data, total }) {
  const chartData = data.map((item) => ({
    ...item,
    fill: getCategoryMeta(item.category).color,
  }));

  if (!chartData.length) {
    return (
      <div className="flex h-[310px] flex-col items-center justify-center text-center">
        <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-[18px] border-slate-100 dark:border-white/[0.06]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              No expenses
            </p>
            <p className="mt-1 font-display text-xl font-bold text-slate-300 dark:text-slate-600">
              ₹0
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-400">Add an expense to see your breakdown.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="relative h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={92}
              paddingAngle={3}
              stroke="none"
              startAngle={90}
              endAngle={-270}
            >
              {chartData.map((entry) => (
                <Cell key={entry.category} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Total spent
          </p>
          <p className="mt-1 font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {formatCurrency(total)}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {chartData.slice(0, 4).map((item) => (
          <div key={item.category} className="flex items-center gap-2.5">
            <CategoryIcon category={item.category} size="sm" />
            <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-slate-600 dark:text-slate-300">
              {item.category}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">{item.percent}%</span>
            <span className="w-[74px] text-right text-[12px] font-semibold tabular-nums text-slate-800 dark:text-slate-200">
              {formatCurrency(item.amount)}
            </span>
          </div>
        ))}
        {chartData.length > 4 && (
          <p className="pt-1 text-[11px] font-medium text-slate-400">
            +{chartData.length - 4} more categor{chartData.length - 4 === 1 ? 'y' : 'ies'}
          </p>
        )}
      </div>
    </div>
  );
}
