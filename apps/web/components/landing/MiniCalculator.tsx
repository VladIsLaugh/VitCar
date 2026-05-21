'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { api } from '@/lib/api';
import type { AvgPriceResponseDto } from '@vitauto/shared-types';
import MakeModelSelect from './MakeModelSelect';
import YearConditionSelect from './YearConditionSelect';
import MiniCalculatorResult from './MiniCalculatorResult';

const MAKE_MODEL_MAP: Record<string, string[]> = {
  Toyota: ['Camry', 'RAV4', 'Corolla', 'Highlander', 'Prius', 'Tacoma'],
  Honda: ['Accord', 'Civic', 'CR-V', 'Pilot', 'Odyssey'],
  BMW: ['3 Series', '5 Series', 'X3', 'X5', 'X7'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'GLE', 'GLC', 'S-Class'],
  Chevrolet: ['Malibu', 'Equinox', 'Tahoe', 'Silverado', 'Traverse'],
  Ford: ['F-150', 'Explorer', 'Escape', 'Mustang', 'Edge'],
  Kia: ['Sorento', 'Sportage', 'Telluride', 'Optima', 'Stinger'],
  Hyundai: ['Sonata', 'Tucson', 'Santa Fe', 'Elantra', 'Palisade'],
  Audi: ['A4', 'A6', 'Q5', 'Q7', 'Q8'],
  Lexus: ['RX', 'ES', 'IS', 'GX', 'NX'],
};

const MAKES = Object.keys(MAKE_MODEL_MAP);

export default function MiniCalculator() {
  const t = useTranslations('Landing.miniCalculator');
  const router = useRouter();

  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [condition, setCondition] = useState('');
  const [lotPrice, setLotPrice] = useState('');

  const allFilled = !!(make && model && year && condition);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['avg-price', make, model, year],
    queryFn: () =>
      api.get<AvgPriceResponseDto>(
        `/lots/avg-price?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}`
      ),
    enabled: !!(make && model && year),
    staleTime: 1000 * 60 * 60,
  });

  const handleGoToCalculator = () => {
    const resolvedPrice = data?.avgPrice != null ? String(data.avgPrice) : lotPrice;
    const params = new URLSearchParams({ make, model, year, condition });
    if (resolvedPrice) params.set('lotPrice', resolvedPrice);
    router.push(`/calculator?${params.toString()}`);
  };

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-lg">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#10B981]">
        {t('title')}
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MakeModelSelect
          makes={MAKES}
          makeModelMap={MAKE_MODEL_MAP}
          make={make}
          model={model}
          onMakeChange={setMake}
          onModelChange={setModel}
        />
        <YearConditionSelect
          year={year}
          condition={condition}
          onYearChange={setYear}
          onConditionChange={setCondition}
        />
      </div>

      {allFilled && (
        <MiniCalculatorResult
          isLoading={isLoading}
          isError={isError}
          avgPrice={data?.avgPrice}
          lotPrice={lotPrice}
          onLotPriceChange={setLotPrice}
          onGoToCalculator={handleGoToCalculator}
        />
      )}

      {!allFilled && (
        <div className="mt-4 flex min-h-16 items-center justify-center rounded-xl border border-dashed border-border">
          <p className="text-xs text-muted-foreground">{t('fillAllFields')}</p>
        </div>
      )}
    </div>
  );
}
