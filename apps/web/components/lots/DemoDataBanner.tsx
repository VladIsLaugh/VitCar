'use client';

import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';

export function DemoDataBanner() {
  const isDemoMode = process.env.NEXT_PUBLIC_CATALOG_DEMO_MODE === 'true';
  const t = useTranslations('catalog');

  if (!isDemoMode) return null;

  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
        <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
          {t('demoDataBanner')}
        </p>
      </div>
    </div>
  );
}
