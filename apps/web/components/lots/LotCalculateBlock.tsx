'use client';

import { useTranslations, useLocale } from 'next-intl';
import type { LotDetailDto } from '@vitauto/shared-types';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';

interface LotCalculateBlockProps {
  lot: LotDetailDto;
}

function inferCarSize(bodyType: string | null): 'small' | 'big' {
  if (!bodyType) return 'small';
  const big = ['suv', 'truck', 'minivan', 'wagon', 'van'];
  return big.some((b) => bodyType.toLowerCase().includes(b)) ? 'big' : 'small';
}

export function LotCalculateBlock({ lot }: LotCalculateBlockProps) {
  const t = useTranslations('catalog');
  const locale = useLocale();

  const calcParams = new URLSearchParams({
    make: lot.make.name,
    model: lot.model.name,
    year: String(lot.year),
    ...(lot.finalBid ? { lotPrice: String(Math.round(lot.finalBid)) } : {}),
    carSize: inferCarSize(lot.bodyType),
  });
  const calcUrl = `/${locale}/calculator?${calcParams.toString()}`;

  const avgPrice = lot.avgPrice
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(lot.avgPrice)
    : null;

  return (
    <div className="sticky top-4 rounded-xl border border-border bg-card p-5 space-y-4">
      {avgPrice && lot.avgPriceSampleSize > 0 && (
        <div className="text-sm space-y-0.5">
          <p className="text-muted-foreground">{t('avgPrice')}</p>
          <p className="text-2xl font-bold">{avgPrice}</p>
          <p className="text-xs text-muted-foreground">
            {t('avgPriceBased', { count: lot.avgPriceSampleSize })}
          </p>
        </div>
      )}

      <a href={calcUrl}>
        <Button className="w-full gap-2" size="lg">
          <Calculator className="h-4 w-4" />
          {t('calculateCta')}
        </Button>
      </a>
    </div>
  );
}
