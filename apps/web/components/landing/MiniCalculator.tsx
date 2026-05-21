'use client';

import { useTranslations } from 'next-intl';

export default function MiniCalculator() {
  const t = useTranslations('Landing.hero');

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-lg">
      <div className="flex min-h-48 items-center justify-center">
        <p className="text-sm text-muted-foreground">{t('miniCalculatorPlaceholder')}</p>
      </div>
    </div>
  );
}
