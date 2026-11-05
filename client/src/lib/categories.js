import {
  Banknote,
  BriefcaseBusiness,
  Building2,
  Car,
  Clapperboard,
  CircleDollarSign,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  Laptop,
  MoreHorizontal,
  Plane,
  ReceiptText,
  ShoppingBag,
  ShoppingBasket,
  TrendingUp,
  UtensilsCrossed,
  Zap,
} from 'lucide-react';

export const CATEGORY_META = {
  Salary: { type: 'income', color: '#10b981', icon: BriefcaseBusiness },
  Freelance: { type: 'income', color: '#0ea5e9', icon: Laptop },
  Business: { type: 'income', color: '#8b5cf6', icon: Building2 },
  Investments: { type: 'income', color: '#84cc16', icon: TrendingUp },
  Gifts: { type: 'income', color: '#ec4899', icon: Gift },
  'Other Income': { type: 'income', color: '#64748b', icon: CircleDollarSign },
  Housing: { type: 'expense', color: '#6366f1', icon: House },
  Groceries: { type: 'expense', color: '#22c55e', icon: ShoppingBasket },
  Dining: { type: 'expense', color: '#f59e0b', icon: UtensilsCrossed },
  Transport: { type: 'expense', color: '#06b6d4', icon: Car },
  Shopping: { type: 'expense', color: '#ec4899', icon: ShoppingBag },
  Health: { type: 'expense', color: '#ef4444', icon: HeartPulse },
  Entertainment: { type: 'expense', color: '#8b5cf6', icon: Clapperboard },
  Education: { type: 'expense', color: '#3b82f6', icon: GraduationCap },
  Utilities: { type: 'expense', color: '#eab308', icon: Zap },
  Travel: { type: 'expense', color: '#14b8a6', icon: Plane },
  Bills: { type: 'expense', color: '#f97316', icon: ReceiptText },
  Other: { type: 'expense', color: '#64748b', icon: MoreHorizontal },
};

export const INCOME_CATEGORIES = Object.entries(CATEGORY_META)
  .filter(([, meta]) => meta.type === 'income')
  .map(([name]) => name);

export const EXPENSE_CATEGORIES = Object.entries(CATEGORY_META)
  .filter(([, meta]) => meta.type === 'expense')
  .map(([name]) => name);

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export function getCategoryMeta(category) {
  return CATEGORY_META[category] || { type: 'expense', color: '#64748b', icon: Banknote };
}

export const NAV_ITEMS = [
  { to: '/', label: 'Overview', end: true },
  { to: '/transactions', label: 'Transactions' },
  { to: '/budgets', label: 'Budgets' },
  { to: '/settings', label: 'Settings' },
];
