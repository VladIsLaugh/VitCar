import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { MakeDto } from '@vitauto/shared-types';
import { DemoDataBanner } from '@/components/lots/DemoDataBanner';
import { CarsClient } from './cars-client';

const isDemoMode = process.env.NEXT_PUBLIC_CATALOG_DEMO_MODE === 'true';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Cars' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: isDemoMode ? 'noindex' : { index: true, follow: true },
    alternates: {
      canonical: `https://vitauto.ua/${locale}/cars`,
    },
  };
}

async function getMakes(): Promise<MakeDto[]> {
  try {
    const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
    const res = await fetch(`${apiUrl}/makes`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return res.json() as Promise<MakeDto[]>;
  } catch {
    return [];
  }
}

export default async function CarsPage({ params }: Props) {
  await params;
  const makes = await getMakes();

  return (
    <main>
      <DemoDataBanner />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <CarsClient initialMakes={makes} />
      </div>
    </main>
  );
}
