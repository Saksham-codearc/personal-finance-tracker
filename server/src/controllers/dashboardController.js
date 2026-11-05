import { Transaction } from '../models/Transaction.js';
import { Budget } from '../models/Budget.js';
import { asyncHandler } from '../utils/http.js';
import {
  getCurrentMonth,
  getMonthRange,
  recentMonths,
  shiftMonth,
} from '../utils/date.js';
import { dashboardQuerySchema } from '../validation/schemas.js';

function amountMap(rows) {
  return rows.reduce(
    (accumulator, row) => {
      accumulator[row._id] = row.total;
      return accumulator;
    },
    { income: 0, expense: 0 }
  );
}

function percentChange(current, previous) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export const getDashboard = asyncHandler(async (req, res) => {
  const query = dashboardQuerySchema.parse(req.query);
  const month = query.month || getCurrentMonth();
  const previousMonth = shiftMonth(month, -1);
  const currentRange = getMonthRange(month);
  const previousRange = getMonthRange(previousMonth);
  const months = recentMonths(month, 6);
  const trendStart = getMonthRange(months[0]).start;

  const [currentTotals, previousTotals, categoryRows, trendRows, recent, budgets] =
    await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            user: req.user._id,
            date: { $gte: currentRange.start, $lt: currentRange.end },
          },
        },
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            user: req.user._id,
            date: { $gte: previousRange.start, $lt: previousRange.end },
          },
        },
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            user: req.user._id,
            type: 'expense',
            date: { $gte: currentRange.start, $lt: currentRange.end },
          },
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            user: req.user._id,
            date: { $gte: trendStart, $lt: currentRange.end },
          },
        },
        {
          $group: {
            _id: {
              month: { $dateToString: { format: '%Y-%m', date: '$date', timezone: 'UTC' } },
              type: '$type',
            },
            total: { $sum: '$amount' },
          },
        },
      ]),
      Transaction.find({ user: req.user._id }).sort({ date: -1, createdAt: -1 }).limit(6),
      Budget.find({ user: req.user._id, month }).sort({ category: 1 }),
    ]);

  const current = amountMap(currentTotals);
  const previous = amountMap(previousTotals);
  const expenseTotal = current.expense;
  const balance = current.income - current.expense;

  const categoryBreakdown = categoryRows.map((row) => ({
    category: row._id,
    amount: row.total,
    count: row.count,
    percent: expenseTotal > 0 ? Math.round((row.total / expenseTotal) * 1000) / 10 : 0,
  }));

  const trendMap = new Map(
    trendRows.map((row) => [`${row._id.month}|${row._id.type}`, row.total])
  );
  const trend = months.map((item) => ({
    month: item,
    income: trendMap.get(`${item}|income`) || 0,
    expense: trendMap.get(`${item}|expense`) || 0,
  }));

  const spendingByCategory = categoryBreakdown.reduce((accumulator, item) => {
    accumulator[item.category] = item.amount;
    return accumulator;
  }, {});

  const budgetItems = budgets.map((budget) => {
    const spent = spendingByCategory[budget.category] || 0;
    return {
      ...budget.toClientJSON(),
      spent,
      remaining: budget.amount - spent,
      percent: budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0,
    };
  });

  const totalBudget = budgetItems.reduce((sum, item) => sum + item.amount, 0);
  const totalBudgetSpent = budgetItems.reduce((sum, item) => sum + item.spent, 0);

  res.json({
    success: true,
    data: {
      month,
      summary: {
        income: current.income,
        expense: current.expense,
        balance,
        savingsRate: current.income > 0 ? Math.round((balance / current.income) * 1000) / 10 : 0,
        incomeChange: percentChange(current.income, previous.income),
        expenseChange: percentChange(current.expense, previous.expense),
      },
      categoryBreakdown,
      trend,
      budgets: {
        items: budgetItems,
        totalBudget,
        totalSpent: totalBudgetSpent,
        remaining: totalBudget - totalBudgetSpent,
        percent: totalBudget > 0 ? Math.round((totalBudgetSpent / totalBudget) * 100) : 0,
      },
      recentTransactions: recent.map((transaction) => transaction.toClientJSON()),
    },
  });
});
