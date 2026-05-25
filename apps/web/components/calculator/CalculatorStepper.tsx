'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useCalculatorStore } from '@/stores/calculator.store';
import type { CalculatorFormInputs } from '@/stores/calculator.store';
import Step1VehicleInfo from './steps/Step1VehicleInfo';
import Step2AuctionInfo from './steps/Step2AuctionInfo';
import Step3Result from './Step3Result';

function canAdvanceFromStep1(inputs: CalculatorFormInputs): boolean {
  return !!(inputs.make && inputs.model && inputs.year && inputs.fuelType && inputs.carSize);
}

function canAdvanceFromStep2(inputs: CalculatorFormInputs): boolean {
  return !!(
    inputs.auctionSource &&
    inputs.usPort &&
    inputs.auctionCondition &&
    inputs.lotPrice
  );
}

const STEP_NAMES = ['step1Name', 'step2Name', 'step3Name'] as const;

export default function CalculatorStepper() {
  const t = useTranslations('Calculator');
  const { step, inputs, isCalculating, error, setStep, calculate } = useCalculatorStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced real-time preview on Step 2 field changes
  useEffect(() => {
    if (step !== 2 || !canAdvanceFromStep2(inputs)) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      calculate();
    }, 600);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs.auctionSource, inputs.usPort, inputs.auctionCondition, inputs.lotPrice, step]);

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as 1 | 2 | 3);
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!canAdvanceFromStep1(inputs)) return;
      setStep(2);
    } else if (step === 2) {
      if (!canAdvanceFromStep2(inputs)) return;
      await calculate();
      setStep(3);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {/* Mobile: condensed label */}
        <p className="text-sm font-medium text-muted-foreground sm:hidden">
          {t('stepOf', { current: step, total: 3 })}
        </p>

        {/* Desktop: full step names */}
        <div className="hidden w-full sm:flex">
          {([1, 2, 3] as const).map((n) => (
            <div key={n} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex w-full items-center">
                {n > 1 && (
                  <div
                    className={`h-0.5 flex-1 transition-colors ${
                      step >= n ? 'bg-accent' : 'bg-border'
                    }`}
                  />
                )}
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    step > n
                      ? 'bg-accent text-white'
                      : step === n
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step > n ? '✓' : n}
                </div>
                {n < 3 && (
                  <div
                    className={`h-0.5 flex-1 transition-colors ${
                      step > n ? 'bg-accent' : 'bg-border'
                    }`}
                  />
                )}
              </div>
              <span
                className={`text-xs ${
                  step === n ? 'font-semibold text-foreground' : 'text-muted-foreground'
                }`}
              >
                {t(STEP_NAMES[n - 1])}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {t(error as Parameters<typeof t>[0])}
        </div>
      )}

      {/* Step content */}
      <div>
        {step === 1 && <Step1VehicleInfo />}
        {step === 2 && <Step2AuctionInfo />}
        {step === 3 && <Step3Result />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {step > 1 ? (
          <Button variant="outline" onClick={handleBack} disabled={isCalculating}>
            {t('back')}
          </Button>
        ) : (
          <div />
        )}

        {step < 3 && (
          <Button
            onClick={handleNext}
            disabled={isCalculating || (step === 1 && !canAdvanceFromStep1(inputs)) || (step === 2 && !canAdvanceFromStep2(inputs))}
          >
            {step === 2 ? (
              isCalculating ? t('calculating') : t('calculate')
            ) : (
              t('next')
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
