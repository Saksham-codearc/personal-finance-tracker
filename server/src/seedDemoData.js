import { Budget } from './models/Budget.js';
import { Transaction } from './models/Transaction.js';
import { User } from './models/User.js';
import { getCurrentMonth, shiftMonth } from './utils/date.js';

export const DEMO_EMAIL = 'demo@finora.app';
export const DEMO_PASSWORD = 'Demo@1234';

function seededAmount(base, seed, spread = 0.28) {
  const random = Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
  const factor = 1 - spread / 2 + random * spread;
  return Math.max(10, Math.round((base * factor) / 10) * 10);
}

function monthDate(month, day) {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Date(Date.UTC(year, monthNumber - 1, day, 12));
}

const expensePlan = [
  { category: 'Housing', base: 28000, day: 3, notes: ['Monthly rent'] },
  { category: 'Groceries', base: 4200, day: 2, notes: ['Weekly groceries', 'Supermarket run'] },
  { category: 'Groceries', base: 1850, day: 5, notes: ['Fresh produce', 'Pantry restock'] },
  { category: 'Dining', base: 1100, day: 4, notes: ['Dinner with friends', 'Weekend brunch'] },
  { category: 'Transport', base: 1500, day: 5, notes: ['Fuel', 'Cab rides'] },
  { category: 'Utilities', base: 3200, day: 6, notes: ['Electricity and internet'] },
  { category: 'Dining', base: 850, day: 8, notes: ['Lunch at work'] },
  { category: 'Shopping', base: 5200, day: 10, notes: ['New shoes', 'Home essentials'] },
  { category: 'Entertainment', base: 1499, day: 12, notes: ['Streaming subscriptions'] },
  { category: 'Groceries', base: 2400, day: 14, notes: ['Weekly groceries'] },
  { category: 'Health', base: 1800, day: 16, notes: ['Pharmacy and vitamins'] },
  { category: 'Transport', base: 1300, day: 18, notes: ['Metro and fuel'] },
  { category: 'Dining', base: 1600, day: 20, notes: ['Family dinner'] },
  { category: 'Bills', base: 1200, day: 21, notes: ['Mobile plan'] },
  { category: 'Shopping', base: 2800, day: 23, notes: ['Clothing'] },
  { category: 'Groceries', base: 2100, day: 25, notes: ['Weekly groceries'] },
  { category: 'Entertainment', base: 900, day: 27, notes: ['Movie night'] },
  { category: 'Travel', base: 6400, day: 28, notes: ['Weekend trip'] },
];

const budgetPlan = [
  { category: 'Housing', amount: 30000 },
  { category: 'Groceries', amount: 11000 },
  { category: 'Dining', amount: 5000 },
  { category: 'Transport', amount: 4000 },
  { category: 'Shopping', amount: 8000 },
  { category: 'Entertainment', amount: 3500 },
  { category: 'Utilities', amount: 4500 },
];

export async function seedDemoData({ reset = false } = {}) {
  const existing = await User.findOne({ email: DEMO_EMAIL });

  if (existing && !reset) {
    return { created: false, user: existing };
  }

  if (existing) {
    await Promise.all([
      Transaction.deleteMany({ user: existing._id }),
      Budget.deleteMany({ user: existing._id }),
      User.deleteOne({ _id: existing._id }),
    ]);
  }

  const passwordHash = await User.hashPassword(DEMO_PASSWORD);
  const user = await User.create({
    name: 'Aarav Mehta',
    email: DEMO_EMAIL,
    passwordHash,
  });

  const today = new Date();
  const currentMonth = getCurrentMonth(today);
  const currentDay = today.getUTCDate();
  const transactions = [];

  for (let offset = 5; offset >= 0; offset -= 1) {
    const month = shiftMonth(currentMonth, -offset);
    const isCurrentMonth = offset === 0;
    const seedBase = (5 - offset) * 31;

    if (!isCurrentMonth || currentDay >= 1) {
      transactions.push({
        user: user._id,
        type: 'income',
        amount: seededAmount(95000, seedBase + 1, 0.05),
        category: 'Salary',
        description: 'Monthly salary',
        date: monthDate(month, 1),
      });
    }

    if (offset % 2 === 0 && (!isCurrentMonth || currentDay >= 10)) {
      transactions.push({
        user: user._id,
        type: 'income',
        amount: seededAmount(18000, seedBase + 2, 0.32),
        category: 'Freelance',
        description: 'Design project milestone',
        date: monthDate(month, 10),
      });
    }

    expensePlan.forEach((item, index) => {
      if (isCurrentMonth && item.day > currentDay) return;

      transactions.push({
        user: user._id,
        type: 'expense',
        amount: seededAmount(item.base, seedBase + index + 10),
        category: item.category,
        description: item.notes[index % item.notes.length],
        date: monthDate(month, item.day),
      });
    });
  }

  await Transaction.insertMany(transactions);

  const budgets = [];
  for (let offset = 0; offset < 3; offset += 1) {
    const month = shiftMonth(currentMonth, -offset);
    budgetPlan.forEach((item) => {
      budgets.push({
        user: user._id,
        month,
        category: item.category,
        amount: item.amount,
      });
    });
  }

  await Budget.insertMany(budgets);

  return { created: true, user };
}
