'use client';

import { useEffect, useRef } from 'react';
import { useCalculatorStore } from '@/stores/calculator.store';
import { saveDraft } from '@/lib/calculator-draft';

export function useCalculatorDraftSync(): void {
  const result = useCalculatorStore((s) => s.result);
  const inputs = useCalculatorStore((s) => s.inputs);
  const prevResultRef = useRef(result);

  useEffect(() => {
    if (result && result !== prevResultRef.current) {
      saveDraft(inputs, result);
    }
    prevResultRef.current = result;
  }, [result, inputs]);
}
