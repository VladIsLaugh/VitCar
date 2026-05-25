'use client';

import { useCalculatorStore, type CalculatorCurrency } from '@/stores/calculator.store';

const CURRENCIES: CalculatorCurrency[] = ['UAH', 'USD', 'EUR'];

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useCalculatorStore();

  return (
    <div className="inline-flex rounded-lg border border-border bg-muted p-1">
      {CURRENCIES.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setCurrency(c)}
          className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
            currency === c
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
