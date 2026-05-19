import { getFormatter } from 'next-intl/server';
import type { Currency } from './formatters';

export async function formatCurrencyServer(
  amount: number,
  currency: Currency = 'UAH'
): Promise<string> {
  const format = await getFormatter();
  return format.number(amount, { style: 'currency', currency });
}

export async function formatNumberServer(amount: number): Promise<string> {
  const format = await getFormatter();
  return format.number(amount);
}

export async function formatDateServer(
  date: Date | string | number,
  style: 'full' | 'long' | 'medium' | 'short' = 'short'
): Promise<string> {
  const format = await getFormatter();
  return format.dateTime(new Date(date), { dateStyle: style });
}
