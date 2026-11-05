export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && (
          <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.16em] text-mint-700 dark:text-mint-400">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-slate-900 dark:text-white sm:text-[28px]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}
