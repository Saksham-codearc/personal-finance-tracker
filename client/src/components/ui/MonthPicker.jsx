import { ChevronLeft, ChevronRight } from 'lucide-react';
import { currentMonthKey, monthLabel, shiftMonthKey } from '../../lib/format';
import { cn } from '../../lib/cn';

export default function MonthPicker({ month, onChange, className }) {
  const isCurrent = month === currentMonthKey();

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white p-1 shadow-sm dark:border-white/10 dark:bg-white/[0.04]',
        className
      )}
    >
      <button
        type="button"
        className="icon-btn h-8 w-8"
        onClick={() => onChange(shiftMonthKey(month, -1))}
        aria-label="Previous month"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="min-w-[112px] px-1 text-center text-sm font-semibold text-slate-700 dark:text-slate-200">
        {monthLabel(month)}
      </span>
      <button
        type="button"
        className="icon-btn h-8 w-8"
        onClick={() => onChange(shiftMonthKey(month, 1))}
        aria-label="Next month"
      >
        <ChevronRight size={16} />
      </button>
      {!isCurrent && (
        <button
          type="button"
          className="rounded-lg px-2 py-1 text-[11px] font-semibold text-mint-700 hover:bg-mint-50 dark:text-mint-400 dark:hover:bg-mint-500/10"
          onClick={() => onChange(currentMonthKey())}
        >
          Today
        </button>
      )}
    </div>
  );
}
