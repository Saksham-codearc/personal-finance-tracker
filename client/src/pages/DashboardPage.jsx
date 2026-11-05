import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Eye,
  EyeOff,
  Landmark,
  PiggyBank,
  Plus,
  ReceiptText,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { dashboardApi, getErrorMessage } from '../lib/api';
import {
  currentMonthKey,
  formatCurrency,
  greeting,
  monthLabel,
} from '../lib/format';
import { cn } from '../lib/cn';
import MonthPicker from '../components/ui/MonthPicker';
import ProgressBar from '../components/ui/ProgressBar';
import SpendingDonut from '../components/charts/SpendingDonut';
import CashFlowChart from '../components/charts/CashFlowChart';
import TransactionItem from '../components/transactions/TransactionItem';
import CategoryIcon from '../components/transactions/CategoryIcon';
import { getCategoryMeta } from '../lib/categories';

function ChangeBadge({ value, inverse = false, suffix = 'vs last month' }) {
  const isPositive = value >= 0;
  const isGood = inverse ? !isPositive : isPositive;
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[11px] font-semibold',
        isGood ? 'text-mint-700 dark:text-mint-400' : 'text-rose-600 dark:text-rose-400'
      )}
    >
      <Icon size={12} />
      {isPositive ? '+' : ''}
      {value}%
      <span className="font-normal text-slate-400 dark:text-slate-500">{suffix}</span>
    </span>
  );
}

function StatCard({ label, value, icon: Icon, color, change, inverse, footer }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">{label}</p>
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}14`, color }}
        >
          <Icon size={17} />
        </span>
      </div>
      <p className="mt-4 font-display text-[26px] font-extrabold tracking-[-0.035em] text-slate-900 dark:text-white">
        {value}
      </p>
      <div className="mt-2.5 min-h-[18px]">
        {change !== undefined ? (
          <ChangeBadge value={change} inverse={inverse} />
        ) : (
          <span className="text-[11px] text-slate-400 dark:text-slate-500">{footer}</span>
        )}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="card h-[164px] p-5">
            <div className="skeleton h-4 w-24" />
            <div className="mt-6 skeleton h-8 w-36" />
            <div className="mt-4 skeleton h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-5">
        <div className="card h-[390px] p-6 xl:col-span-3">
          <div className="skeleton h-5 w-40" />
          <div className="mt-8 flex h-[260px] items-end gap-4">
            {[55, 74, 45, 86, 64, 92].map((height, index) => (
              <div key={index} className="skeleton flex-1" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
        <div className="card h-[390px] p-6 xl:col-span-2">
          <div className="skeleton h-5 w-36" />
          <div className="mx-auto mt-8 skeleton h-[220px] w-[220px] rounded-full" />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-[12px] text-slate-400 dark:text-slate-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function budgetTone(percent) {
  if (percent > 100) return 'bg-rose-500';
  if (percent >= 80) return 'bg-amber-500';
  return 'bg-mint-500';
}

function averageDaysForMonth(month) {
  const now = new Date();
  const currentMonth = currentMonthKey();
  if (month === currentMonth) return Math.max(now.getDate(), 1);
  if (month < currentMonth) {
    const [year, monthNumber] = month.split('-').map(Number);
    return new Date(year, monthNumber, 0).getDate();
  }
  return 0;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { dataVersion, openTransactionModal } = useUI();
  const [month, setMonth] = useState(currentMonthKey);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hideBalance, setHideBalance] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    dashboardApi
      .get(month)
      .then((response) => {
        if (active) setDashboard(response.data.data);
      })
      .catch((requestError) => {
        if (active) setError(getErrorMessage(requestError, 'Unable to load your dashboard.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [month, dataVersion, reloadKey]);

  const firstName = user?.name?.split(' ')[0] || 'there';
  const summary = dashboard?.summary;
  const averageDays = averageDaysForMonth(month);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {greeting()}, <span className="text-slate-800 dark:text-slate-200">{firstName}</span>
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.035em] text-slate-900 dark:text-white sm:text-[30px]">
            Here&apos;s your money at a glance
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            A clear look at {monthLabel(month)} — no spreadsheets needed.
          </p>
        </div>
        <MonthPicker month={month} onChange={setMonth} />
      </div>

      {error && (
        <div className="card flex flex-col items-start justify-between gap-4 border-rose-200/70 p-5 dark:border-rose-500/20 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
              <AlertCircle size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                We couldn&apos;t load your overview
              </p>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{error}</p>
            </div>
          </div>
          <button type="button" className="btn-secondary" onClick={() => setReloadKey((key) => key + 1)}>
            Try again
          </button>
        </div>
      )}

      {loading && !dashboard ? (
        <DashboardSkeleton />
      ) : dashboard ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="relative overflow-hidden rounded-3xl bg-[#0a1b14] p-5 text-white shadow-float">
              <div className="absolute -right-12 -top-14 h-40 w-40 rounded-full border-[24px] border-white/[0.035]" />
              <div className="absolute -bottom-16 -left-8 h-36 w-36 rounded-full bg-mint-500/10 blur-2xl" />
              <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[12px] font-medium text-white/45">Net balance</p>
                    <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-white/25">
                      {monthLabel(month)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHideBalance((hidden) => !hidden)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/50 transition hover:bg-white/10 hover:text-white"
                    aria-label={hideBalance ? 'Show balance' : 'Hide balance'}
                  >
                    {hideBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <p className="mt-5 font-display text-[30px] font-extrabold tracking-[-0.045em]">
                  {hideBalance ? '••••••' : formatCurrency(summary.balance)}
                </p>

                <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold',
                      summary.balance >= 0
                        ? 'bg-mint-400/10 text-mint-300'
                        : 'bg-rose-400/10 text-rose-300'
                    )}
                  >
                    {summary.balance >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {summary.savingsRate}% saved
                  </span>
                  <div className="flex h-7 items-end gap-1">
                    {dashboard.trend.map((item) => {
                      const max = Math.max(...dashboard.trend.map((row) => row.income), 1);
                      return (
                        <span
                          key={item.month}
                          className="w-1.5 rounded-full bg-mint-400/30 last:bg-mint-400"
                          style={{ height: `${Math.max(16, (item.income / max) * 100)}%` }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <StatCard
              label="Income"
              value={formatCurrency(summary.income)}
              icon={ArrowDownLeft}
              color="#07955f"
              change={summary.incomeChange}
            />
            <StatCard
              label="Expenses"
              value={formatCurrency(summary.expense)}
              icon={ArrowUpRight}
              color="#e11d48"
              change={summary.expenseChange}
              inverse
            />
            <StatCard
              label="Budget remaining"
              value={formatCurrency(dashboard.budgets.remaining)}
              icon={Target}
              color="#6366f1"
              footer={
                dashboard.budgets.totalBudget > 0
                  ? `${dashboard.budgets.percent}% of ${formatCurrency(
                      dashboard.budgets.totalBudget
                    )} used`
                  : 'No budgets set for this month'
              }
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-5">
            <section className="card p-5 sm:p-6 xl:col-span-3">
              <SectionHeader
                title="Cash flow"
                description="Income and spending over the last six months"
                action={
                  <span className="hidden items-center gap-1.5 rounded-full bg-mint-50 px-2.5 py-1 text-[10px] font-semibold text-mint-700 dark:bg-mint-500/10 dark:text-mint-400 sm:inline-flex">
                    <TrendingUp size={11} />
                    {summary.savingsRate}% saved
                  </span>
                }
              />
              <div className="mt-4">
                <CashFlowChart data={dashboard.trend} />
              </div>
            </section>

            <section className="card p-5 sm:p-6 xl:col-span-2">
              <SectionHeader
                title="Spending breakdown"
                description="Where your money went this month"
              />
              <div className="mt-4">
                <SpendingDonut
                  data={dashboard.categoryBreakdown}
                  total={summary.expense}
                />
              </div>
            </section>
          </div>

          <div className="grid gap-5 xl:grid-cols-5">
            <section className="card p-5 sm:p-6 xl:col-span-2">
              <SectionHeader
                title="Budgets"
                description={`${monthLabel(month)} progress`}
                action={
                  <Link
                    to="/budgets"
                    className="text-[12px] font-semibold text-mint-700 hover:text-mint-800 dark:text-mint-400 dark:hover:text-mint-300"
                  >
                    Manage
                  </Link>
                }
              />

              {dashboard.budgets.items.length > 0 ? (
                <div className="mt-5">
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.03]">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                          Total budget
                        </p>
                        <p className="mt-1 font-display text-xl font-bold text-slate-900 dark:text-white">
                          {formatCurrency(dashboard.budgets.totalBudget)}
                        </p>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {formatCurrency(dashboard.budgets.totalSpent)} spent
                      </p>
                    </div>
                    <ProgressBar
                      value={dashboard.budgets.percent}
                      className="mt-3"
                      barClassName={budgetTone(dashboard.budgets.percent)}
                    />
                  </div>

                  <div className="mt-3 space-y-3">
                    {dashboard.budgets.items.slice(0, 3).map((budget) => (
                      <div key={budget.id} className="flex items-center gap-3">
                        <CategoryIcon category={budget.category} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="truncate text-[12px] font-semibold text-slate-700 dark:text-slate-200">
                              {budget.category}
                            </p>
                            <p className="shrink-0 text-[10px] font-semibold text-slate-400">
                              {budget.percent}%
                            </p>
                          </div>
                          <ProgressBar
                            value={budget.percent}
                            height="h-1.5"
                            className="mt-1.5"
                            barClassName={budgetTone(budget.percent)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-8 flex flex-col items-center py-6 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-400">
                    <PiggyBank size={21} />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Give every rupee a job
                  </p>
                  <p className="mt-1 max-w-[220px] text-[12px] leading-5 text-slate-500 dark:text-slate-400">
                    Create category budgets to keep your spending on track.
                  </p>
                  <Link to="/budgets" className="btn-secondary mt-4 px-3 py-2 text-xs">
                    Set up budgets
                  </Link>
                </div>
              )}
            </section>

            <section className="card p-5 sm:p-6 xl:col-span-3">
              <SectionHeader
                title="Recent activity"
                description="Your latest money movements"
                action={
                  <Link
                    to="/transactions"
                    className="inline-flex items-center gap-1 text-[12px] font-semibold text-mint-700 hover:text-mint-800 dark:text-mint-400 dark:hover:text-mint-300"
                  >
                    View all
                    <ArrowRight size={13} />
                  </Link>
                }
              />

              {dashboard.recentTransactions.length > 0 ? (
                <div className="mt-2 divide-y divide-slate-100 dark:divide-white/[0.05]">
                  {dashboard.recentTransactions.map((transaction) => (
                    <TransactionItem key={transaction.id} transaction={transaction} />
                  ))}
                </div>
              ) : (
                <div className="mt-8 flex flex-col items-center py-8 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/[0.06] dark:text-slate-500">
                    <ReceiptText size={21} />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    No transactions yet
                  </p>
                  <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">
                    Add your first income or expense to get started.
                  </p>
                  <button
                    type="button"
                    className="btn-primary mt-4 px-3 py-2 text-xs"
                    onClick={() => openTransactionModal()}
                  >
                    <Plus size={14} />
                    Add transaction
                  </button>
                </div>
              )}
            </section>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                label: 'Top spending category',
                value: dashboard.categoryBreakdown[0]?.category || 'No expenses',
                detail: dashboard.categoryBreakdown[0]
                  ? `${dashboard.categoryBreakdown[0].percent}% of monthly spending`
                  : 'Add an expense to see insights',
                icon: ReceiptText,
                color: dashboard.categoryBreakdown[0]
                  ? getCategoryMeta(dashboard.categoryBreakdown[0].category).color
                  : '#64748b',
              },
              {
                label: 'Average daily spend',
                value: averageDays ? formatCurrency(summary.expense / averageDays) : '—',
                detail: averageDays
                  ? month === currentMonthKey()
                    ? 'Based on this month so far'
                    : `Across ${averageDays} days`
                  : 'No spending recorded yet',
                icon: Wallet,
                color: '#0ea5e9',
              },
              {
                label: 'Savings this month',
                value: formatCurrency(Math.max(summary.balance, 0)),
                detail: `${summary.savingsRate}% of income kept`,
                icon: Landmark,
                color: '#8b5cf6',
              },
            ].map((insight) => (
              <div key={insight.label} className="card-subtle flex items-center gap-3 p-4">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${insight.color}14`, color: insight.color }}
                >
                  <insight.icon size={18} />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                    {insight.label}
                  </p>
                  <p className="mt-0.5 truncate font-display text-[15px] font-bold text-slate-900 dark:text-white">
                    {insight.value}
                  </p>
                  <p className="truncate text-[10px] text-slate-400">{insight.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
