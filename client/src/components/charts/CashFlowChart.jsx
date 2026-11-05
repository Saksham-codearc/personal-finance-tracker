import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../lib/format';
import ChartTooltip from './ChartTooltip';

function shortMonth(month) {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
}

export default function CashFlowChart({ data }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const chartData = data.map((item) => ({ ...item, label: shortMonth(item.month) }));

  return (
    <div>
      <div className="mb-4 flex items-center justify-end gap-4 text-[11px] font-medium text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-mint-500" />
          Income
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
          Expenses
        </span>
      </div>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 0, left: -14, bottom: 0 }} barGap={6}>
            <CartesianGrid
              vertical={false}
              stroke={isDark ? 'rgba(255,255,255,0.06)' : '#eef2f0'}
              strokeDasharray="4 4"
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 11 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 11 }}
              tickFormatter={(value) => formatCurrency(value, { compact: true })}
            />
            <Tooltip
              cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : '#f8faf9', radius: 8 }}
              content={<ChartTooltip />}
            />
            <Bar
              dataKey="income"
              name="Income"
              fill="#12b876"
              radius={[6, 6, 0, 0]}
              maxBarSize={24}
            />
            <Bar
              dataKey="expense"
              name="Expenses"
              fill={isDark ? '#334155' : '#cbd5e1'}
              radius={[6, 6, 0, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
