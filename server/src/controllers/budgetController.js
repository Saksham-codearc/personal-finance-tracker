import { Budget } from '../models/Budget.js';
import { Transaction } from '../models/Transaction.js';
import { asyncHandler, createError } from '../utils/http.js';
import { getCurrentMonth, getMonthRange } from '../utils/date.js';
import { budgetQuerySchema } from '../validation/schemas.js';
import { EXPENSE_CATEGORIES } from '../utils/categories.js';

async function categorySpending(userId, month) {
  const { start, end } = getMonthRange(month);
  const result = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: 'expense',
        date: { $gte: start, $lt: end },
      },
    },
    { $group: { _id: '$category', spent: { $sum: '$amount' } } },
  ]);

  return result.reduce((accumulator, item) => {
    accumulator[item._id] = item.spent;
    return accumulator;
  }, {});
}

export const listBudgets = asyncHandler(async (req, res) => {
  const query = budgetQuerySchema.parse(req.query);
  const month = query.month || getCurrentMonth();

  const [budgets, spending] = await Promise.all([
    Budget.find({ user: req.user._id, month }).sort({ category: 1 }),
    categorySpending(req.user._id, month),
  ]);

  const items = budgets.map((budget) => {
    const spent = spending[budget.category] || 0;
    return {
      ...budget.toClientJSON(),
      spent,
      remaining: budget.amount - spent,
      percent: budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0,
    };
  });

  const totalBudget = items.reduce((sum, item) => sum + item.amount, 0);
  const totalSpent = items.reduce((sum, item) => sum + item.spent, 0);

  res.json({
    success: true,
    data: {
      month,
      budgets: items,
      summary: {
        totalBudget,
        totalSpent,
        remaining: totalBudget - totalSpent,
        percent: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
      },
    },
  });
});

export const upsertBudget = asyncHandler(async (req, res) => {
  const { category, amount, month } = req.body;

  if (!EXPENSE_CATEGORIES.includes(category)) {
    throw createError(400, 'Budgets can only be set for expense categories.');
  }

  const budget = await Budget.findOneAndUpdate(
    { user: req.user._id, category, month },
    { amount: Math.round(amount * 100) / 100 },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.status(201).json({
    success: true,
    message: 'Budget saved.',
    data: { budget: budget.toClientJSON() },
  });
});

export const deleteBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!budget) {
    throw createError(404, 'Budget not found.');
  }

  res.json({
    success: true,
    message: 'Budget removed.',
  });
});
