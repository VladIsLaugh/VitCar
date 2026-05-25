'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCalculatorStore } from '@/stores/calculator.store';
import type { CalculatorFormInputs } from '@/stores/calculator.store';
import CalculatorStepper from '@/components/calculator/CalculatorStepper';
import Step3Result from '@/components/calculator/Step3Result';
import type { AuctionCondition, CarSize, FuelType } from '@vitauto/shared-types';

export default function CalculatorClient() {
  const searchParams = useSearchParams();
  const { setInputs, setStep, calculate } = useCalculatorStore();

  useEffect(() => {
    useCalculatorStore.getState().fetchRates();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

    if (Object.keys(preFill).length === 0) return;
    setInputs(preFill);
    if (preFill.lotPrice) {
      calculate().then(() => { setStep(2); });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
      <CalculatorStepper />
      <div className="hidden lg:block">
        <div className="sticky top-6">
          <Step3Result />
        </div>
      </div>
    </div>
  );
}
