import { describe, it, expect } from 'vitest';
import { formatAmount, formatNumber, formatDate } from '../formatters';

describe('formatAmount', () => {
  it('formats USD for en locale', () => {
    expect(formatAmount(8500, 'USD', 'en')).toBe('$8,500');
  });

  it('formats USD for uk locale', () => {
    const result = formatAmount(8500, 'USD', 'uk');
    expect(result).toContain('8');
    expect(result).toContain('500');
  });

  it('formats UAH for uk locale', () => {
    const result = formatAmount(650000, 'UAH', 'uk');
    expect(result).toContain('650');
    expect(result).toContain('000');
    expect(result).toContain('₴');
  });

  it('formats UAH for en locale', () => {
    const result = formatAmount(650000, 'UAH', 'en');
    expect(result).toContain('650,000');
  });

  it('formats EUR for en locale', () => {
    expect(formatAmount(1000, 'EUR', 'en')).toBe('€1,000');
  });
});

describe('formatNumber', () => {
  it('formats numbers with en separators', () => {
    expect(formatNumber(1234567, 'en')).toBe('1,234,567');
  });

  it('formats numbers with uk separators', () => {
    const result = formatNumber(1234567, 'uk');
    expect(result).toContain('1');
    expect(result).toContain('234');
    expect(result).toContain('567');
  });
});

describe('formatDate', () => {
  const date = new Date('2026-05-01');

  it('formats date for en locale with short style', () => {
    const result = formatDate(date, 'en');
    expect(result).toContain('5');
    expect(result).toContain('1');
  });

  it('formats date for uk locale with short style', () => {
    const result = formatDate(date, 'uk');
    expect(result).toContain('01');
    expect(result).toContain('05');
  });

  it('formats date for en locale with long style', () => {
    const result = formatDate(date, 'en', { dateStyle: 'long' });
    expect(result).toContain('2026');
    expect(result).toContain('May');
  });
});
