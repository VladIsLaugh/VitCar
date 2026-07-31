'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCalculatorStore } from '@/stores/calculator.store';
import type { CalculatorFormInputs } from '@/stores/calculator.store';
import { loadDraft, clearDraft } from '@/lib/calculator-draft';
import { useCalculatorDraftSync } from '@/hooks/useCalculatorDraftSync';
import CalculatorStepper from '@/components/calculator/CalculatorStepper';
import Step3Result from '@/components/calculator/Step3Result';
import { Button } from '@/components/ui/button';
import type { AuctionCondition, CarSize, FuelType } from '@vitauto/shared-types';

export default function CalculatorClient() {
  const t = useTranslations('Calculator');
  const searchParams = useSearchParams();
  const { setInputs, setStep, calculate } = useCalculatorStore();
  const [pendingDraft, setPendingDraft] = useState<ReturnType<typeof loadDraft>>(null);

  useCalculatorDraftSync();

  useEffect(() => {
    useCalculatorStore.getState().fetchRates();
  }, []);

  useEffect(() => {
    const preFill: CalculatorFormInputs = {};
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const year = searchParams.get('year');
    const condition = searchParams.get('condition');
    const lotPrice = searchParams.get('lotPrice');
    const carSize = searchParams.get('carSize');
    const fuelType = searchParams.get('fuelType');

    if (make) preFill.make = make;
    if (model) preFill.model = model;
    if (year) preFill.year = Number(year);
    if (condition) preFill.auctionCondition = condition as AuctionCondition;
    if (lotPrice) preFill.lotPrice = Number(lotPrice);
    if (carSize) preFill.carSize = carSize as CarSize;
    if (fuelType) preFill.fuelType = fuelType as FuelType;

    // URL params take priority — skip draft restore
    if (Object.keys(preFill).length > 0) {
      setInputs(preFill);
      if (preFill.lotPrice) {
        calculate().then(() => {
          setStep(2);
        });
      }
      return;
    }

    // Offer draft restore only when no URL params present
    const draft = loadDraft();
    if (draft) {
      setPendingDraft(draft);
    }
  }, []);

  const handleRestoreDraft = () => {
    if (!pendingDraft) return;
    const store = useCalculatorStore.getState();
    store.setInputs(pendingDraft.inputs);
    // Restore result directly so the user sees the previous breakdown immediately
    useCalculatorStore.setState({ result: pendingDraft.result, step: 3 });
    clearDraft();
    setPendingDraft(null);
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setPendingDraft(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {pendingDraft && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm">
          <span className="text-foreground">{t('draftBanner')}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="default" onClick={handleRestoreDraft}>
              {t('draftRestore')}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDiscardDraft}>
              {t('draftDiscard')}
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
        <CalculatorStepper />
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <Step3Result />
          </div>
        </div>
      </div>
    </div>
  );
}
