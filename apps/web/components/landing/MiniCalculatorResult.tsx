'use client';

import { useTranslations } from 'next-intl';

interface Props {
  isLoading: boolean;
  isError: boolean;
  avgPrice: number | null | undefined;
  lotPrice: string;
  onLotPriceChange: (v: string) => void;
  onGoToCalculator: () => void;
}

export default function MiniCalculatorResult({
  isLoading,
  isError,
  avgPrice,
  lotPrice,
  onLotPriceChange,
  onGoToCalculator,
}: Props) {
  const t = useTranslations('Landing.miniCalculator');

  const showManualInput = isError || (!isLoading && avgPrice === null);

  return (
    <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4">
      {isLoading ? (
        <div className="space-y-2">
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        </div>
      ) : (
        <>
          {isError && <p className="mb-2 text-xs text-destructive">{t('loadingError')}</p>}

          {showManualInput ? (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                {t('manualPriceLabel')}
              </label>
              <input
                type="number"
                value={lotPrice}
                onChange={(e) => onLotPriceChange(e.target.value)}
                min={0}
                placeholder="8500"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
          ) : (
            avgPrice !== undefined && (
              <div>
                <p className="text-2xl font-bold text-foreground">
                  ${avgPrice?.toLocaleString('en-US')}
                </p>
                <p className="text-xs text-muted-foreground">{t('avgPriceHint')}</p>
              </div>
            )
          )}
        </>
      )}

      <button
        onClick={onGoToCalculator}
        className="mt-4 w-full rounded-lg bg-[#10B981] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#059669] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#10B981]"
      >
        {t('ctaButton')}
      </button>
    </div>
  );
}
