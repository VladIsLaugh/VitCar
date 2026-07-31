'use client';

import type { CalculationResultDto } from '@vitauto/shared-types';
import CurrencySwitcher from '@/components/calculator/CurrencySwitcher';
import ResultBreakdown from '@/components/calculator/ResultBreakdown';
import { useTranslations } from 'next-intl';

interface Props {
  result: CalculationResultDto;
}

export default function ShareResultPanel({ result }: Props) {
  const t = useTranslations('Calculator');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">{t('result.title')}</h3>
        <CurrencySwitcher />
      </div>
      <ResultBreakdown result={result} />
    </div>
  );
}
