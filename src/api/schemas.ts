import { z } from 'zod';

// Базовые схемы для ключевых ответов API FinanceMarker

export const TokenInfoSchema = z.object({
  day_limit: z.number(),
  valid_to: z.string(), // ISO date string
});
export type TokenInfo = z.infer<typeof TokenInfoSchema>;

export const ExchangeSchema = z.object({
  exchange: z.string(),
  name: z.string(),
  country: z.string(),
  currency: z.string(),
  mic: z.string(),
});
export type Exchange = z.infer<typeof ExchangeSchema>;

export const CalendarSchema = z.object({
  category: z.string(),
  code: z.string(),
  date: z.string(),
  event: z.string(),
  exchange: z.string(),
  link: z.string().url().optional(),
  month: z.number().int(),
  period: z.string().optional(),
  type: z.string().optional(),
  year: z.number().int(),
});
export type Calendar = z.infer<typeof CalendarSchema>;

export const DividendSchema = z.object({
  changed_at: z.string(),
  code: z.string(),
  div_amount: z.number().optional(),
  div_curr: z.string().optional(),
  div_percent: z.number().optional(),
  exchange: z.string(),
  last_buy_date: z.string().optional(),
  last_buy_price: z.number().optional(),
  link: z.string().url().optional(),
  reestr_close_date: z.string().optional(),
  type: z.string().optional(),
  year: z.number().int(),
});
export type Dividend = z.infer<typeof DividendSchema>;

// Вспомогательные однотипные ответы (списки)
export const ExchangeListSchema = z.array(ExchangeSchema);
export const CalendarListSchema = z.array(CalendarSchema);
export const DividendListSchema = z.array(DividendSchema);


