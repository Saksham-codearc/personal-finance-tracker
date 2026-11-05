import { z } from 'zod';
import { ALL_CATEGORIES } from '../utils/categories.js';

const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use YYYY-MM format');
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format')
  .refine((value) => !Number.isNaN(new Date(`${value}T12:00:00.000Z`).getTime()), 'Invalid date');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be 72 characters or fewer')
    .regex(/[A-Za-z]/, 'Include at least one letter')
    .regex(/[0-9]/, 'Include at least one number'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
});

export const transactionBodySchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce
    .number({ error: 'Enter a valid amount' })
    .positive('Amount must be greater than zero')
    .max(1_000_000_000, 'Amount is too large'),
  category: z.enum(ALL_CATEGORIES, {
    error: 'Choose a valid category',
  }),
  description: z.string().trim().max(160, 'Note must be 160 characters or fewer').optional().default(''),
  date: dateSchema,
});

export const transactionUpdateSchema = transactionBodySchema.partial();

export const transactionListSchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().trim().max(40).optional(),
  search: z.string().trim().max(100).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.enum(['date_desc', 'date_asc', 'amount_desc', 'amount_asc']).default('date_desc'),
});

export const dashboardQuerySchema = z.object({
  month: monthSchema.optional(),
});

export const budgetQuerySchema = z.object({
  month: monthSchema.optional(),
});

export const budgetBodySchema = z.object({
  category: z.enum(ALL_CATEGORIES),
  amount: z.coerce
    .number({ error: 'Enter a valid budget' })
    .positive('Budget must be greater than zero')
    .max(1_000_000_000),
  month: monthSchema,
});
