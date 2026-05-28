import type { Metadata } from 'next';
import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: '404 — Page not found | VitAuto',
  robots: { index: false, follow: false },
};

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'NotFound' });

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl font-extrabold text-primary/20 select-none">404</p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        {t('title')}
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">{t('description')}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/">{t('backHome')}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/cars">{t('browseCars')}</Link>
        </Button>
      </div>
    </main>
  );
}
