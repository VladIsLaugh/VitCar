import type { CalculationResultDto } from '@vitauto/shared-types';
import type { CalculatorFormInputs } from '@/stores/calculator.store';

const DRAFT_KEY = 'vitauto:calculator_draft';
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface CalculatorDraft {
  inputs: CalculatorFormInputs;
  result: CalculationResultDto;
  savedAt: number;
}

export function saveDraft(inputs: CalculatorFormInputs, result: CalculationResultDto): void {
  try {
    const draft: CalculatorDraft = { inputs, result, savedAt: Date.now() };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // localStorage unavailable (private mode, quota exceeded)
  }
}

export function loadDraft(): CalculatorDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as CalculatorDraft;
    if (Date.now() - draft.savedAt > DRAFT_TTL_MS) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}
