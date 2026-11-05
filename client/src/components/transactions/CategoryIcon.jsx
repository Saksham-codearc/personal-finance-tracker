import { getCategoryMeta } from '../../lib/categories';
import { cn } from '../../lib/cn';

const sizes = {
  sm: { wrapper: 'h-8 w-8 rounded-lg', icon: 14 },
  md: { wrapper: 'h-10 w-10 rounded-xl', icon: 17 },
  lg: { wrapper: 'h-12 w-12 rounded-2xl', icon: 20 },
};

export default function CategoryIcon({ category, size = 'md', className }) {
  const meta = getCategoryMeta(category);
  const Icon = meta.icon;
  const sizing = sizes[size] || sizes.md;

  return (
    <span
      className={cn('flex shrink-0 items-center justify-center', sizing.wrapper, className)}
      style={{ backgroundColor: `${meta.color}16`, color: meta.color }}
    >
      <Icon size={sizing.icon} strokeWidth={2.1} />
    </span>
  );
}
