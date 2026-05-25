'use client';

import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useCalculatorStore } from '@/stores/calculator.store';
import CurrencySwitcher from './CurrencySwitcher';
import ResultBreakdown from './ResultBreakdown';
import ShareButtons from './ShareButtons';

export default function Step3Result() {
  const t = useTranslations('Calculator');
  const { result, isCalculating, error, calculate } = useCalculatorStore();

  if (error && !result) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {t(error as Parameters<typeof t>[0])}
        </div>
        <Button variant="outline" size="sm" onClick={calculate}>
          {t('result.retryButton')}
        </Button>
      </div>
    );
  }

  if (isCalculating) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-32" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2 rounded-lg border p-4">
            <Skeleton className="h-5 w-40" />
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-6 text-center">
        <p className="text-sm font-medium text-foreground">{t('result.empty')}</p>
        <p className="text-xs text-muted-foreground">{t('result.emptyHint')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">{t('result.title')}</h3>
        <CurrencySwitcher />
      </div>
      <ResultBreakdown result={result} />
      <ShareButtons />
    </div>
  );
}
