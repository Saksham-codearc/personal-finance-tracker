import { formatCurrency, formatDate } from '../../lib/format';
import { cn } from '../../lib/cn';
import CategoryIcon from './CategoryIcon';

export default function TransactionItem({ transaction, showDate = true, className }) {
  const isIncome = transaction.type === 'income';

  return (
    <div className={cn('flex items-center gap-3 py-3', className)}>
      <CategoryIcon category={transaction.category} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-slate-800 dark:text-slate-100">
          {transaction.description || transaction.category}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-slate-400 dark:text-slate-500">
          {transaction.category}
          {showDate && <span> · {formatDate(transaction.date)}</span>}
        </p>
      </div>
      <p
        className={cn(
          'shrink-0 text-[13px] font-bold tabular-nums',
          isIncome ? 'text-mint-700 dark:text-mint-400' : 'text-slate-800 dark:text-slate-200'
        )}
      >
        {isIncome ? '+' : '−'} {formatCurrency(transaction.amount)}
      </p>
    </div>
  );
}
