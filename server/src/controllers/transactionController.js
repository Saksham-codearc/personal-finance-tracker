import { Transaction } from '../models/Transaction.js';
import { asyncHandler, createError } from '../utils/http.js';
import { dayRange, parseDateValue, toDateInput } from '../utils/date.js';
import { transactionListSchema } from '../validation/schemas.js';

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildFilter(userId, query) {
  const filter = { user: userId };

  if (query.type) filter.type = query.type;
  if (query.category) filter.category = query.category;

  if (query.startDate || query.endDate) {
    filter.date = dayRange(query.startDate, query.endDate);
  }

  if (query.search) {
    const search = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [{ description: search }, { category: search }];
  }

  return filter;
}

function sortValue(sort) {
  const sortMap = {
    date_desc: { date: -1, createdAt: -1 },
    date_asc: { date: 1, createdAt: 1 },
    amount_desc: { amount: -1, date: -1 },
    amount_asc: { amount: 1, date: -1 },
  };
  return sortMap[sort] || sortMap.date_desc;
}

export const listTransactions = asyncHandler(async (req, res) => {
  const query = transactionListSchema.parse(req.query);
  const filter = buildFilter(req.user._id, query);
  const skip = (query.page - 1) * query.limit;

  const [transactions, total, totals] = await Promise.all([
    Transaction.find(filter).sort(sortValue(query.sort)).skip(skip).limit(query.limit),
    Transaction.countDocuments(filter),
    Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]),
  ]);

  const summary = totals.reduce(
    (accumulator, item) => {
      accumulator[item._id] = item.total;
      return accumulator;
    },
    { income: 0, expense: 0 }
  );

  res.json({
    success: true,
    data: {
      transactions: transactions.map((transaction) => transaction.toClientJSON()),
      summary,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.max(1, Math.ceil(total / query.limit)),
      },
    },
  });
});

export const createTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.create({
    ...req.body,
    amount: Math.round(req.body.amount * 100) / 100,
    date: parseDateValue(req.body.date),
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Transaction added.',
    data: { transaction: transaction.toClientJSON() },
  });
});

export const updateTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!transaction) {
    throw createError(404, 'Transaction not found.');
  }

  const updates = { ...req.body };
  if (updates.amount !== undefined) {
    updates.amount = Math.round(updates.amount * 100) / 100;
  }
  if (updates.date !== undefined) {
    updates.date = parseDateValue(updates.date);
  }

  Object.assign(transaction, updates);
  await transaction.save();

  res.json({
    success: true,
    message: 'Transaction updated.',
    data: { transaction: transaction.toClientJSON() },
  });
});

export const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!transaction) {
    throw createError(404, 'Transaction not found.');
  }

  res.json({
    success: true,
    message: 'Transaction deleted.',
  });
});

function csvCell(value) {
  let safe = String(value ?? '');
  if (/^[=+\-@]/.test(safe)) safe = `'${safe}`;
  return `"${safe.replace(/"/g, '""')}"`;
}

export const exportTransactions = asyncHandler(async (req, res) => {
  const rawQuery = { ...req.query, page: 1, limit: 100 };
  const query = transactionListSchema.parse(rawQuery);
  const filter = buildFilter(req.user._id, query);

  const transactions = await Transaction.find(filter)
    .sort(sortValue(query.sort))
    .limit(5000)
    .lean();

  const rows = transactions.map((transaction) =>
    [
      toDateInput(transaction.date),
      transaction.type,
      transaction.category,
      transaction.description || '',
      transaction.amount.toFixed(2),
    ].map(csvCell).join(',')
  );

  const csv = ['Date,Type,Category,Description,Amount', ...rows].join('\r\n');
  const filename = `finora-transactions-${new Date().toISOString().slice(0, 10)}.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(`\uFEFF${csv}`);
});
