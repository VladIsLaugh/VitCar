export type Currency = 'USD' | 'UAH' | 'EUR';

export function formatAmount(amount: number, currency: Currency, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(amount);
}

export function formatDate(
  date: Date | string | number,
  locale: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'short' }
): string {
  return new Intl.DateTimeFormat(locale, options).format(new Date(date));
}
