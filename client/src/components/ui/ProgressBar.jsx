import { cn } from '../../lib/cn';

export default function ProgressBar({ value = 0, className, barClassName, height = 'h-2' }) {
  const width = Math.min(Math.max(value, 0), 100);

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.07]',
        height,
        className
      )}
    >
      <div
        className={cn('h-full rounded-full bg-mint-500 transition-all duration-500', barClassName)}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
