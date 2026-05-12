import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Currency } from '@/lib/formatters';

interface CurrencyStore {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set) => ({
      currency: 'UAH',
      setCurrency: (currency) => set({ currency }),
    }),
    { name: 'vitauto-currency' }
  )
);
