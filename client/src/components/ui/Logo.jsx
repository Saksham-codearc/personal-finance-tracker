import { WalletCards } from 'lucide-react';
import { cn } from '../../lib/cn';

export default function Logo({ className, markOnly = false, light = false }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-mint-400 to-mint-700 text-white shadow-[0_8px_20px_-8px_rgba(7,149,95,0.8)]">
        <WalletCards size={19} strokeWidth={2.2} />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#d7f9e7] dark:border-coal-900" />
      </div>
      {!markOnly && (
        <span
          className={cn(
            'font-display text-[22px] font-extrabold tracking-[-0.04em]',
            light ? 'text-white' : 'text-slate-900 dark:text-white'
          )}
        >
          finora<span className="text-mint-500">.</span>
        </span>
      )}
    </div>
  );
}
