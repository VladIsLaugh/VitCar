'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';

export default function LotDetailError({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations('catalog');

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center gap-4">
      <p className="text-muted-foreground">{t('grid.errorState')}</p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>
          {t('grid.retryButton')}
        </Button>
        <Button asChild>
          <Link href="/cars">{t('breadcrumbCatalog')}</Link>
        </Button>
      </div>
    </main>
  );
}
