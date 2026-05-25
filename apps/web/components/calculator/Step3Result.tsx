'use client';

import { useTranslations } from 'next-intl';

// Cost breakdown accordion implemented in CAR-58
export default function Step3Result() {
  const t = useTranslations('Calculator');

  return (
    <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-border">
      <p className="text-sm text-muted-foreground">{t('step3Placeholder')}</p>
    </div>
  );
}
