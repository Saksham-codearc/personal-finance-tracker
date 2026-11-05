export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investments',
  'Gifts',
  'Other Income',
];

export const EXPENSE_CATEGORIES = [
  'Housing',
  'Groceries',
  'Dining',
  'Transport',
  'Shopping',
  'Health',
  'Entertainment',
  'Education',
  'Utilities',
  'Travel',
  'Bills',
  'Other',
];

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export function isValidCategory(category) {
  return ALL_CATEGORIES.includes(category);
}
