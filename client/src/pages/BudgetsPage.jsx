import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  CalendarRange,
  CheckCircle2,
  Pencil,
  Plus,
  Target,
  Trash2,
  Wallet,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import MonthPicker from '../components/ui/MonthPicker';
import EmptyState from '../components/ui/EmptyState';
import ProgressBar from '../components/ui/ProgressBar';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import BudgetModal from '../components/budgets/BudgetModal';
import CategoryIcon from '../components/transactions/CategoryIcon';
import { useUI } from '../context/UIContext';
import { budgetApi, getErrorMessage } from '../lib/api';
import { EXPENSE_CATEGORIES, getCategoryMeta } from '../lib/categories';
import { currentMonthKey, formatCurrency, monthLabel } from '../lib/format';
import { cn } from '../lib/cn';

function budgetTone(percent) {
  if (percent > 100) return 'bg-rose-500';
  if (percent >= 80) return 'bg-amber-500';
  return 'bg-mint-500';
}

function BudgetSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="card p-5">
          <div className="flex items-center gap-3">
            <div className="skeleton h-10 w-10 rounded-xl" />
            <div className="flex-1">
              <div className="skeleton h-3.5 w-24" />
              <div className="mt-2 skeleton h-3 w-16" />
            </div>
          </div>
          <div className="mt-5 skeleton h-2 w-full" />
          <div className="mt-4 flex justify-between">
            <div className="skeleton h-3 w-24" />
            <div className="skeleton h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BudgetsPage() {
  const { dataVersion, notifyDataChanged } = useUI();
  const [month, setMonth] = useState(currentMonthKey);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [modal, setModal] = useState({ open: false, budget: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    budgetApi
      .list(month)
      .then((response) => {
        if (active) setData(response.data.data);
      })
      .catch((requestError) => {
        if (active) setError(getErrorMessage(requestError, 'Unable to load budgets.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [month, dataVersion, reloadKey]);

  const existingCategories = useMemo(
    () => (data?.budgets || []).map((budget) => budget.category),
    [data]
  );

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await budgetApi.remove(deleteTarget.id);
      toast.success('Budget removed');
      setDeleteTarget(null);
      notifyDataChanged();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, 'Unable to remove budget.'));
    } finally {
      setDeleting(false);
    }
  }

  const summary = data?.summary || { totalBudget: 0, totalSpent: 0, remaining: 0, percent: 0 };
  const allBudgeted = existingCategories.length >= EXPENSE_CATEGORIES.length;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        eyebrow="Plan with intention"
        title="Budgets"
        description={`Set category limits for ${monthLabel(month)} and track how you are doing.`}
        actions={
          <>
            <MonthPicker month={month} onChange={setMonth} />
            <button
              type="button"
              className="btn-primary"
              onClick={() => setModal({ open: true, budget: null })}
              disabled={allBudgeted}
              title={allBudgeted ? 'Every category already has a budget' : undefined}
            >
              <Plus size={17} />
              Add budget
            </button>
          </>
        }
      />

      {error && (
        <div className="card flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
              <AlertTriangle size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Could not load budgets
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
            </div>
          </div>
          <button type="button" className="btn-secondary" onClick={() => setReloadKey((key) => key + 1)}>
            Try again
          </button>
        </div>
      )}

      {loading && !data ? (
        <BudgetSkeleton />
      ) : data ? (
        <>
          <section className="card overflow-hidden">
            <div className="grid lg:grid-cols-[1.4fr_1fr]">
              <div className="relative overflow-hidden bg-[#0a1b14] p-6 text-white sm:p-7">
                <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border-[30px] border-white/[0.035]" />
                <div className="absolute -bottom-20 left-10 h-44 w-44 rounded-full bg-mint-500/10 blur-3xl" />
                <div className="relative">
                  <div className="flex items-center gap-2 text-mint-300">
                    <CalendarRange size={15} />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                      {monthLabel(month)} plan
                    </span>
                  </div>
                  <p className="mt-4 text-[12px] text-white/45">Total monthly budget</p>
                  <p className="mt-1 font-display text-[34px] font-extrabold tracking-[-0.045em]">
                    {formatCurrency(summary.totalBudget)}
                  </p>

                  <div className="mt-6 flex items-center justify-between text-[11px] text-white/45">
                    <span>{formatCurrency(summary.totalSpent)} spent</span>
                    <span>{summary.percent}%</span>
                  </div>
                  <ProgressBar
                    value={summary.percent}
                    className="mt-2 bg-white/10"
                    barClassName={budgetTone(summary.percent)}
                    height="h-2.5"
                  />

                  <p className="mt-3 text-[11px] leading-5 text-white/35">
                    {summary.remaining >= 0
                      ? `${formatCurrency(summary.remaining)} left across ${
                          data.budgets.length
                        } categor${data.budgets.length === 1 ? 'y' : 'ies'}`
                      : `${formatCurrency(Math.abs(summary.remaining))} over your total budget`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-px bg-slate-100 dark:bg-white/[0.06]">
                {[
                  {
                    label: 'Spent',
                    value: formatCurrency(summary.totalSpent),
                    icon: Wallet,
                    color: '#e11d48',
                    note: 'Across budgeted categories',
                  },
                  {
                    label: 'Remaining',
                    value: formatCurrency(summary.remaining),
                    icon: CheckCircle2,
                    color: '#07955f',
                    note: summary.remaining >= 0 ? 'Still available' : 'Over budget',
                  },
                  {
                    label: 'Categories',
                    value: `${data.budgets.length}`,
                    icon: Target,
                    color: '#6366f1',
                    note: `${EXPENSE_CATEGORIES.length - data.budgets.length} unplanned`,
                  },
                  {
                    label: 'On track',
                    value: `${data.budgets.filter((budget) => budget.percent <= 100).length}`,
                    icon: CheckCircle2,
                    color: '#0ea5e9',
                    note: 'Within their limits',
                  },
                ].map((item) => (
                  <div key={item.label} className="bg-white p-4 dark:bg-coal-900 sm:p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                        {item.label}
                      </p>
                      <item.icon size={15} style={{ color: item.color }} />
                    </div>
                    <p className="mt-2 font-display text-lg font-bold text-slate-900 dark:text-white">
                      {item.value}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Category budgets
              </h2>
              <p className="mt-0.5 text-[12px] text-slate-400">
                {data.budgets.length} active limit{data.budgets.length === 1 ? '' : 's'} for{' '}
                {monthLabel(month)}
              </p>
            </div>
            {allBudgeted && (
              <span className="hidden text-[11px] font-medium text-slate-400 sm:block">
                All categories covered
              </span>
            )}
          </div>

          {data.budgets.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={Target}
                title="No budgets for this month"
                description="Create category budgets to give your spending a clear boundary and know exactly where you stand."
                action={
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setModal({ open: true, budget: null })}
                  >
                    <Plus size={16} />
                    Create your first budget
                  </button>
                }
              />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.budgets.map((budget) => {
                const meta = getCategoryMeta(budget.category);
                const over = budget.percent > 100;

                return (
                  <div key={budget.id} className="card p-5 transition-shadow hover:shadow-lg">
                    <div className="flex items-start gap-3">
                      <CategoryIcon category={budget.category} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-bold text-slate-900 dark:text-white">
                          {budget.category}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {formatCurrency(budget.amount)} monthly limit
                        </p>
                      </div>
                      <div className="flex gap-0.5">
                        <button
                          type="button"
                          className="icon-btn h-8 w-8"
                          onClick={() => setModal({ open: true, budget })}
                          aria-label={`Edit ${budget.category} budget`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn h-8 w-8 hover:text-rose-600 dark:hover:text-rose-400"
                          onClick={() => setDeleteTarget(budget)}
                          aria-label={`Delete ${budget.category} budget`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 flex items-end justify-between">
                      <p className="font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {formatCurrency(budget.spent)}
                      </p>
                      <span
                        className={cn(
                          'badge',
                          over
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                            : budget.percent >= 80
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                              : 'bg-mint-50 text-mint-700 dark:bg-mint-500/10 dark:text-mint-400'
                        )}
                      >
                        {budget.percent}%
                      </span>
                    </div>

                    <ProgressBar
                      value={budget.percent}
                      className="mt-3"
                      barClassName={budgetTone(budget.percent)}
                    />

                    <div className="mt-3 flex items-center justify-between">
                      <p
                        className={cn(
                          'text-[11px] font-medium',
                          over
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-500 dark:text-slate-400'
                        )}
                      >
                        {over
                          ? `${formatCurrency(Math.abs(budget.remaining))} over budget`
                          : `${formatCurrency(budget.remaining)} remaining`}
                      </p>
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: meta.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : null}

      <BudgetModal
        open={modal.open}
        month={month}
        budget={modal.budget}
        existingCategories={existingCategories}
        onClose={() => setModal({ open: false, budget: null })}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Remove budget?"
        description={
          deleteTarget
            ? `Remove the ${formatCurrency(deleteTarget.amount)} ${deleteTarget.category} budget for ${monthLabel(
                month
              )}? Your transactions will not be affected.`
            : ''
        }
      />
    </div>
  );
}
