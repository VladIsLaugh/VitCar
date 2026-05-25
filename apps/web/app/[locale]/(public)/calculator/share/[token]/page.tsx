import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import type { CalculationBreakdown } from '@vitauto/shared-types';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ locale: string; token: string }>;
};

async function fetchSharedCalculation(token: string): Promise<CalculationBreakdown | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
  try {
    const res = await fetch(`${apiUrl}/calculations/share/${token}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Calculator' });
  return {
    title: t('shareMetaTitle'),
    description: t('shareMetaDescription'),
  };
}

export default async function SharedCalculatorPage({ params }: Props) {
  const { locale, token } = await params;
  const t = await getTranslations({ locale, namespace: 'Calculator' });

  const data = await fetchSharedCalculation(token);
  if (!data) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
        {t('shareTitle')}
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">{t('shareReadOnly')}</p>

      {/* Result breakdown rendered in CAR-58 */}
      <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-border">
        <p className="text-sm text-muted-foreground">{t('step3Placeholder')}</p>
      </div>
    </main>
  );
}
