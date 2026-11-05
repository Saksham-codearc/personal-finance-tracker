import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Download,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import CategoryIcon from '../components/transactions/CategoryIcon';
import { useUI } from '../context/UIContext';
import { getErrorMessage, transactionApi } from '../lib/api';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, getCategoryMeta } from '../lib/categories';
import { useDebounce } from '../lib/useDebounce';
import { formatCurrency, formatDate } from '../lib/format';
import { cn } from '../lib/cn';

const defaultFilters = {
  search: '',
  type: '',
  category: '',
  startDate: '',
  endDate: '',
  sort: 'date_desc',
};

function TypeBadge({ type }) {
  const isIncome = type === 'income';
  return (
    <span
      className={cn(
        'badge',
        isIncome
          ? 'bg-mint-50 text-mint-700 dark:bg-mint-500/10 dark:text-mint-400'
          : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
      )}
    >
      {isIncome ? <ArrowDownLeft size={11} /> : <ArrowUpRight size={11} />}
      {isIncome ? 'Income' : 'Expense'}
    </span>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 px-2 py-3">
          <div className="skeleton h-10 w-10 rounded-xl" />
          <div className="flex-1">
            <div className="skeleton h-3.5 w-40" />
            <div className="mt-2 skeleton h-3 w-24" />
          </div>
          <div className="skeleton hidden h-3 w-24 sm:block" />
          <div className="skeleton h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export default function TransactionsPage() {
  const { dataVersion, openTransactionModal, notifyDataChanged } = useUI();
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const debouncedSearch = useDebounce(filters.search);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    transactionApi
      .list({
        search: debouncedSearch || undefined,
        type: filters.type || undefined,
        category: filters.category || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        sort: filters.sort,
        page,
        limit: 8,
      })
      .then((response) => {
        if (active) setData(response.data.data);
      })
      .catch((requestError) => {
        if (active) setError(getErrorMessage(requestError, 'Unable to load transactions.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [
    debouncedSearch,
    filters.type,
    filters.category,
    filters.startDate,
    filters.endDate,
    filters.sort,
    page,
    dataVersion,
    reloadKey,
  ]);

  const categoryOptions = useMemo(() => {
    if (filters.type === 'income') return INCOME_CATEGORIES;
    if (filters.type === 'expense') return EXPENSE_CATEGORIES;
    return [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
  }, [filters.type]);

  const hasFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'sort') return value !== 'date_desc';
    return Boolean(value);
  });

  function updateFilter(field, value) {
    setFilters((current) => {
      const next = { ...current, [field]: value };
      if (field === 'type' && value === 'income' && !INCOME_CATEGORIES.includes(current.category)) {
        next.category = '';
      }
      if (field === 'type' && value === 'expense' && !EXPENSE_CATEGORIES.includes(current.category)) {
        next.category = '';
      }
      return next;
    });
    setPage(1);
  }

  function clearFilters() {
    setFilters(defaultFilters);
    setPage(1);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await transactionApi.remove(deleteTarget.id);
      toast.success('Transaction deleted');
      setDeleteTarget(null);
      notifyDataChanged();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, 'Unable to delete transaction.'));
    } finally {
      setDeleting(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const response = await transactionApi.exportCsv({
        type: filters.type || undefined,
        category: filters.category || undefined,
        search: debouncedSearch || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        sort: filters.sort,
      });
      const url = URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `finora-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success('CSV exported');
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, 'Unable to export transactions.'));
    } finally {
      setExporting(false);
    }
  }

  const transactions = data?.transactions || [];
  const summary = data?.summary || { income: 0, expense: 0 };
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0, limit: 8 };
  const rangeStart = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const rangeEnd = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        eyebrow="Money in, money out"
        title="Transactions"
        description="Search, filter, and keep every entry in order."
        actions={
          <>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? <LoaderCircle size={16} className="animate-spin" /> : <Download size={16} />}
              Export CSV
            </button>
            <button type="button" className="btn-primary" onClick={() => openTransactionModal()}>
              <Plus size={17} />
              Add transaction
            </button>
          </>
        }
      />

      <div className="card p-4 sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={filters.search}
              onChange={(event) => updateFilter('search', event.target.value)}
              placeholder="Search notes or categories..."
              className="input pl-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:flex">
            <select
              value={filters.type}
              onChange={(event) => updateFilter('type', event.target.value)}
              className="select min-w-0 xl:w-[128px]"
              aria-label="Filter by type"
            >
              <option value="">All types</option>
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
            </select>

            <select
              value={filters.category}
              onChange={(event) => updateFilter('category', event.target.value)}
              className="select min-w-0 xl:w-[145px]"
              aria-label="Filter by category"
            >
              <option value="">All categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
              <input
                type="date"
                value={filters.startDate}
                onChange={(event) => updateFilter('startDate', event.target.value)}
                className="input min-w-0 px-2.5 text-xs xl:w-[135px]"
                aria-label="Start date"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={filters.endDate}
                onChange={(event) => updateFilter('endDate', event.target.value)}
                className="input min-w-0 px-2.5 text-xs xl:w-[135px]"
                aria-label="End date"
              />
            </div>

            <select
              value={filters.sort}
              onChange={(event) => updateFilter('sort', event.target.value)}
              className="select col-span-2 min-w-0 sm:col-span-1 xl:w-[140px]"
              aria-label="Sort transactions"
            >
              <option value="date_desc">Newest first</option>
              <option value="date_asc">Oldest first</option>
              <option value="amount_desc">Highest amount</option>
              <option value="amount_asc">Lowest amount</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3 dark:border-white/[0.05]">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <SlidersHorizontal size={13} />
            {pagination.total} result{pagination.total === 1 ? '' : 's'}
          </div>
          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="text-mint-700 dark:text-mint-400">
              Income {formatCurrency(summary.income)}
            </span>
            <span className="text-rose-600 dark:text-rose-400">
              Expenses {formatCurrency(summary.expense)}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              Net {formatCurrency(summary.income - summary.expense)}
            </span>
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/[0.06]">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Transaction history
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Showing {rangeStart}–{rangeEnd} of {pagination.total}
            </p>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setReloadKey((key) => key + 1)}
            aria-label="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {error ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Could not load transactions
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{error}</p>
            <button
              type="button"
              className="btn-secondary mt-4"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Try again
            </button>
          </div>
        ) : loading && !data ? (
          <div className="px-5 py-2">
            <TableSkeleton />
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={Search}
            title={hasFilters ? 'No matching transactions' : 'No transactions yet'}
            description={
              hasFilters
                ? 'Try adjusting your search or filters to find what you are looking for.'
                : 'Add your first income or expense and it will show up here.'
            }
            action={
              hasFilters ? (
                <button type="button" className="btn-secondary" onClick={clearFilters}>
                  Clear filters
                </button>
              ) : (
                <button type="button" className="btn-primary" onClick={() => openTransactionModal()}>
                  <Plus size={16} />
                  Add transaction
                </button>
              )
            }
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:border-white/[0.06] dark:text-slate-500">
                    <th className="px-5 py-3">Transaction</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => {
                    const meta = getCategoryMeta(transaction.category);
                    return (
                      <tr
                        key={transaction.id}
                        className="table-row transition-colors hover:bg-slate-50/60 dark:hover:bg-white/[0.02]"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <CategoryIcon category={transaction.category} />
                            <div className="min-w-0">
                              <p className="max-w-[240px] truncate text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                                {transaction.description || transaction.category}
                              </p>
                              <p className="mt-0.5 text-[11px] text-slate-400">
                                {transaction.type === 'income' ? 'Money in' : 'Money out'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className="badge"
                            style={{ backgroundColor: `${meta.color}12`, color: meta.color }}
                          >
                            {transaction.category}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-[12px] text-slate-500 dark:text-slate-400">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-4 py-3.5">
                          <TypeBadge type={transaction.type} />
                        </td>
                        <td
                          className={cn(
                            'px-4 py-3.5 text-right text-[13px] font-bold tabular-nums',
                            transaction.type === 'income'
                              ? 'text-mint-700 dark:text-mint-400'
                              : 'text-slate-800 dark:text-slate-100'
                          )}
                        >
                          {transaction.type === 'income' ? '+' : '−'}{' '}
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex justify-end gap-0.5">
                            <button
                              type="button"
                              className="icon-btn h-8 w-8"
                              onClick={() => openTransactionModal(transaction)}
                              aria-label="Edit transaction"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              className="icon-btn h-8 w-8 hover:text-rose-600 dark:hover:text-rose-400"
                              onClick={() => setDeleteTarget(transaction)}
                              aria-label="Delete transaction"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/[0.05] md:hidden">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <CategoryIcon category={transaction.category} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                        {transaction.description || transaction.category}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {transaction.category} · {formatDate(transaction.date)}
                      </p>
                    </div>
                    <p
                      className={cn(
                        'shrink-0 text-[13px] font-bold tabular-nums',
                        transaction.type === 'income'
                          ? 'text-mint-700 dark:text-mint-400'
                          : 'text-slate-800 dark:text-slate-100'
                      )}
                    >
                      {transaction.type === 'income' ? '+' : '−'}{' '}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between pl-[52px]">
                    <TypeBadge type={transaction.type} />
                    <div className="flex gap-1">
                      <button
                        type="button"
                        className="icon-btn h-8 w-8"
                        onClick={() => openTransactionModal(transaction)}
                        aria-label="Edit transaction"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn h-8 w-8 hover:text-rose-600 dark:hover:text-rose-400"
                        onClick={() => setDeleteTarget(transaction)}
                        aria-label="Delete transaction"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 dark:border-white/[0.06] sm:flex-row">
              <p className="text-[11px] text-slate-400">
                Page {pagination.page} of {pagination.pages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn-secondary px-3 py-2 text-xs"
                  disabled={pagination.page <= 1 || loading}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>
                <button
                  type="button"
                  className="btn-secondary px-3 py-2 text-xs"
                  disabled={pagination.page >= pagination.pages || loading}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete transaction?"
        description={
          deleteTarget
            ? `This will permanently delete “${
                deleteTarget.description || deleteTarget.category
              }” for ${formatCurrency(deleteTarget.amount)}. This action cannot be undone.`
            : ''
        }
      />
    </div>
  );
}
