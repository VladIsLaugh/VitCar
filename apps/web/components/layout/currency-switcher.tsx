'use client';

import { useEffect, useState } from 'react';
import { useCurrencyStore } from '@/stores/currency.store';
import type { Currency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

const CURRENCIES: Currency[] = ['USD', 'UAH', 'EUR'];

export function CurrencySwitcher() {
  const [mounted, setMounted] = useState(false);
  const { currency, setCurrency } = useCurrencyStore();

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-[104px] h-7" />;

  return (
    <div
      className="flex items-center text-sm font-medium"
      role="group"
      aria-label="Currency switcher"
    >
      {CURRENCIES.map((cur, index) => (
        <span key={cur} className="flex items-center">
          {index > 0 && (
            <span className="text-border select-none mx-0.5" aria-hidden="true">
              |
            </span>
          )}
          <button
            onClick={() => setCurrency(cur)}
            className={cn(
              'px-1.5 py-1 rounded-sm transition-colors',
              currency === cur
                ? 'text-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
            aria-pressed={currency === cur}
          >
            {cur}
          </button>
        </span>
      ))}
    </div>
  );
}
