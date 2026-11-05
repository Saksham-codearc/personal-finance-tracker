import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { LoaderCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import CategoryIcon from '../transactions/CategoryIcon';
import { useUI } from '../../context/UIContext';
import { budgetApi, getErrorMessage } from '../../lib/api';
import { EXPENSE_CATEGORIES } from '../../lib/categories';
import { cn } from '../../lib/cn';
import { monthLabel } from '../../lib/format';

export default function BudgetModal({ open, month, budget, existingCategories = [], onClose }) {
  const { notifyDataChanged } = useUI();
  const isEditing = Boolean(budget);
  const availableCategories = EXPENSE_CATEGORIES.filter(
    (category) => isEditing || !existingCategories.includes(category)
  );

  const [category, setCategory] = useState(availableCategories[0] || 'Groceries');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCategory(budget?.category || availableCategories[0] || 'Groceries');
    setAmount(budget ? String(budget.amount) : '');
    setErrors({});
    // availableCategories is derived from props and intentionally excluded to avoid resetting the form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, budget]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!amount || Number(amount) <= 0) {
      setErrors({ amount: 'Enter a budget greater than zero.' });
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      await budgetApi.save({ category, amount: Number(amount), month });
      toast.success(isEditing ? 'Budget updated' : 'Budget created');
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
      title={isEditing ? 'Edit budget' : 'Create a budget'}
      description={`Set a monthly limit for ${monthLabel(month)}.`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Category</label>
          <div className="grid max-h-[260px] grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4">
            {availableCategories.map((item) => (
              <button
                type="button"
                key={item}
                disabled={isEditing}
                onClick={() => {
                  setCategory(item);
                  setErrors((current) => ({ ...current, category: undefined }));
                }}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-xl border px-1 py-2.5 text-center transition-all disabled:cursor-not-allowed',
                  category === item
                    ? 'border-mint-500 bg-mint-50 dark:border-mint-400/60 dark:bg-mint-500/10'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-white/[0.08] dark:hover:bg-white/[0.04]'
                )}
              >
                <CategoryIcon category={item} size="sm" />
                <span
                  className={cn(
                    'text-[10px] font-semibold leading-tight',
                    category === item
                      ? 'text-mint-800 dark:text-mint-300'
                      : 'text-slate-500 dark:text-slate-400'
                  )}
                >
                  {item}
                </span>
              </button>
            ))}
          </div>
          {availableCategories.length === 0 && (
            <p className="mt-2 text-sm text-slate-500">Every expense category already has a budget.</p>
          )}
          {errors.category && <p className="field-error">{errors.category}</p>}
        </div>

        <div>
          <label className="label" htmlFor="budget-amount">
            Monthly limit
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-display text-lg font-semibold text-slate-400">
              ₹
            </span>
            <input
              id="budget-amount"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              autoFocus
              placeholder="0"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                setErrors({});
              }}
              className={cn(
                'input py-3 pl-9 font-display text-xl font-bold',
                errors.amount && 'input-error'
              )}
            />
          </div>
          {errors.amount && <p className="field-error">{errors.amount}</p>}
        </div>

        <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-5 dark:border-white/[0.06]">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary min-w-[120px]"
            disabled={saving || availableCategories.length === 0}
          >
            {saving && <LoaderCircle size={17} className="animate-spin" />}
            {saving ? 'Saving…' : isEditing ? 'Save budget' : 'Create budget'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
