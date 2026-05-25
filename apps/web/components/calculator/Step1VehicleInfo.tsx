'use client';

import { useTranslations } from 'next-intl';

// Form fields implemented in follow-up story (FE: Calculator form steps 1 & 2)
export default function Step1VehicleInfo() {
  const t = useTranslations('Calculator');

  return (
    <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-border">
      <p className="text-sm text-muted-foreground">{t('step1Placeholder')}</p>
    </div>
  );
}
