import { create } from 'zustand';
import { apiClient } from '@/lib/api-client';
import type { CalculationInputs, CalculationResultDto, ExchangeRates } from '@vitauto/shared-types';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export type CalculatorCurrency = 'UAH' | 'USD' | 'EUR';

// Extends CalculationInputs with display/form-only fields not sent to the API
export type CalculatorFormInputs = Partial<CalculationInputs> & {
  make?: string;
  model?: string;
  bodyType?: string;
  vin?: string;
  mileage?: number;
  mileageUnit?: 'miles' | 'km';
  // engineVolume in store is cc (API format); form shows liters
};

interface CalculatorStore {
  step: 1 | 2 | 3;
  inputs: CalculatorFormInputs;
  result: CalculationResultDto | null;
  rates: ExchangeRates | null;
  currency: CalculatorCurrency;
  savedId: string | null;
  shareToken: string | null;
  isCalculating: boolean;
  isSaving: boolean;
  error: string | null;

  setStep: (step: 1 | 2 | 3) => void;
  setInputs: (inputs: CalculatorFormInputs) => void;
  setCurrency: (currency: CalculatorCurrency) => void;
  calculate: () => Promise<void>;
  save: () => Promise<{ id: string; shareToken: string }>;
  reset: () => void;
  convertAmount: (usd: number) => number;
  fetchRates: () => Promise<void>;
}

const initialState = {
  step: 1 as const,
  inputs: {} as CalculatorFormInputs,
  result: null,
  rates: null,
  currency: 'UAH' as CalculatorCurrency,
  savedId: null,
  shareToken: null,
  isCalculating: false,
  isSaving: false,
  error: null,
};

export const useCalculatorStore = create<CalculatorStore>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  setInputs: (inputs) => set((state) => ({ inputs: { ...state.inputs, ...inputs } })),

  setCurrency: (currency) => set({ currency }),

  fetchRates: async () => {
    // Use plain fetch (not apiClient) to avoid triggering the 401→refresh interceptor
    // on a public endpoint — exchange rates require no auth.
    try {
      const res = await fetch(`${API_BASE}/exchange-rates/current`);
      if (!res.ok) return;
      const data: ExchangeRates = await res.json();
      set({ rates: data });
    } catch {
      // Rates unavailable — convertAmount will fallback to USD
    }
  },

  calculate: async () => {
    const { inputs } = get();
    // Strip display-only fields before sending to API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { make, model, bodyType, vin, mileage, mileageUnit, ...apiInputs } = inputs;

    set({ isCalculating: true, error: null });
    try {
      const { data } = await apiClient.post<CalculationResultDto>(
        '/calculations/calculate',
        apiInputs
      );
      set({ result: data, isCalculating: false });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 503) {
        set({ error: 'errors.ratesUnavailable', isCalculating: false });
      } else {
        set({ error: 'errors.calculationFailed', isCalculating: false });
      }
    }
  },

  save: async () => {
    const { inputs, result } = get();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { make, model, bodyType, vin, mileage, mileageUnit, ...apiInputs } = inputs;
    set({ isSaving: true });
    try {
      const { data } = await apiClient.post<{ id: string; shareToken: string }>(
        '/calculations/save',
        { inputParams: apiInputs, result }
      );
      set({ savedId: data.id, shareToken: data.shareToken, isSaving: false });
      return data;
    } catch {
      set({ isSaving: false });
      throw new Error('calculator.errors.saveFailed');
    }
  },

  reset: () => set(initialState),

  convertAmount: (usd) => {
    const { currency, rates } = get();
    if (!rates) return usd;
    switch (currency) {
      case 'USD':
        return usd;
      case 'UAH':
        return usd * rates.usdUah;
      case 'EUR':
        return usd / rates.eurUsd;
    }
  },
}));
