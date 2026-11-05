import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowDownLeft, ArrowUpRight, LoaderCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import { useUI } from '../../context/UIContext';
import { getErrorMessage, transactionApi } from '../../lib/api';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../lib/categories';
import { todayInputValue } from '../../lib/format';
import { cn } from '../../lib/cn';
import CategoryIcon from './CategoryIcon';

const blankForm = {
  type: 'expense',
  amount: '',
  category: 'Groceries',
  description: '',
  date: todayInputValue(),
};

export default function TransactionModal({ open, transaction, onClose }) {
  const { notifyDataChanged } = useUI();
  const [form, setForm] = useState(blankForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(transaction);

  useEffect(() => {
    if (!open) return;

    if (transaction) {
      setForm({
        type: transaction.type,
        amount: String(transaction.amount),
        category: transaction.category,
        description: transaction.description || '',
        date: new Date(transaction.date).toISOString().slice(0, 10),
      });
    } else {
      setForm({ ...blankForm, date: todayInputValue() });
    }
    setErrors({});
  }, [open, transaction]);

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  }

  function changeType(type) {
    const nextCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    setForm((current) => ({
      ...current,
      type,
      category: nextCategories.includes(current.category) ? current.category : nextCategories[0],
    }));
    setErrors((current) => ({ ...current, category: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};

    if (!form.amount || Number(form.amount) <= 0) {
      nextErrors.amount = 'Enter an amount greater than zero.';
    }
    if (!form.category) nextErrors.category = 'Choose a category.';
    if (!form.date) nextErrors.date = 'Choose a date.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      const payload = {
        type: form.type,
        amount: Number(form.amount),
        category: form.category,
        description: form.description.trim(),
        date: form.date,
      };

      if (isEditing) {
        await transactionApi.update(transaction.id, payload);
        toast.success('Transaction updated');
      } else {
        await transactionApi.create(payload);
        toast.success('Transaction added');
      }

      notifyDataChanged();
      onClose();
    } catch (error) {
      const fieldErrors = error.response?.data?.fields;
      if (fieldErrors) setErrors(fieldErrors);
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit transaction' : 'Add transaction'}
      description={isEditing ? 'Update the details of this entry.' : 'Record money coming in or going out.'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5 dark:bg-white/[0.04]">
          <button
            type="button"
            onClick={() => changeType('expense')}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all',
              form.type === 'expense'
                ? 'bg-white text-rose-600 shadow-sm dark:bg-coal-800 dark:text-rose-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            <ArrowUpRight size={16} />
            Expense
          </button>
          <button
            type="button"
            onClick={() => changeType('income')}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all',
              form.type === 'income'
                ? 'bg-white text-mint-700 shadow-sm dark:bg-coal-800 dark:text-mint-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            <ArrowDownLeft size={16} />
            Income
          </button>
        </div>

        <div>
          <label className="label" htmlFor="amount">
            Amount
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-display text-xl font-semibold text-slate-400">
              ₹
            </span>
            <input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              autoFocus
              value={form.amount}
              onChange={(event) => updateField('amount', event.target.value)}
              className={cn(
                'input py-3.5 pl-10 font-display text-2xl font-bold tracking-tight',
                errors.amount && 'input-error'
              )}
            />
          </div>
          {errors.amount && <p className="field-error">{errors.amount}</p>}
        </div>

        <div>
          <label className="label">Category</label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                onClick={() => updateField('category', category)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-xl border px-1 py-2.5 text-center transition-all',
                  form.category === category
                    ? 'border-mint-500 bg-mint-50 dark:border-mint-400/60 dark:bg-mint-500/10'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-white/[0.08] dark:hover:bg-white/[0.04]'
                )}
              >
                <CategoryIcon category={category} size="sm" />
                <span
                  className={cn(
                    'text-[10px] font-semibold leading-tight',
                    form.category === category
                      ? 'text-mint-800 dark:text-mint-300'
                      : 'text-slate-500 dark:text-slate-400'
                  )}
                >
                  {category}
                </span>
              </button>
            ))}
          </div>
          {errors.category && <p className="field-error">{errors.category}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="date">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={form.date}
              onChange={(event) => updateField('date', event.target.value)}
              className={cn('input', errors.date && 'input-error')}
            />
            {errors.date && <p className="field-error">{errors.date}</p>}
          </div>
          <div>
            <label className="label" htmlFor="description">
              Note <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="description"
              type="text"
              maxLength={160}
              placeholder="e.g. Weekly groceries"
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              className={cn('input', errors.description && 'input-error')}
            />
            {errors.description && <p className="field-error">{errors.description}</p>}
          </div>
        </div>

        {errors.form && <p className="field-error">{errors.form}</p>}

        <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-5 dark:border-white/[0.06]">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn-primary min-w-[130px]" disabled={saving}>
            {saving ? <LoaderCircle size={17} className="animate-spin" /> : null}
            {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Add transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
