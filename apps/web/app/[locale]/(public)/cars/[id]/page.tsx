import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { LotDetailDto } from '@vitauto/shared-types';
import { DemoDataBanner } from '@/components/lots/DemoDataBanner';
import { Link } from '@/i18n/routing';
import { LotDetailClient } from './lot-detail-client';

export const revalidate = 600;

const isDemoMode = process.env.NEXT_PUBLIC_CATALOG_DEMO_MODE === 'true';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

async function getLot(id: string): Promise<LotDetailDto | null> {
  try {
    const res = await fetch(`${API_URL}/lots/${id}`, { next: { revalidate } });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json() as Promise<LotDetailDto>;
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/lots?limit=1000&sortBy=saleDate_desc`);
    if (!res.ok) return [];
    const data = (await res.json()) as { items: Array<{ id: string }> };
    return data.items.map((lot) => ({ id: lot.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const lot = await getLot(id);
  const t = await getTranslations({ locale, namespace: 'catalog' });

  if (!lot) {
    return { title: t('lotNotFound') };
  }

  const title = `${lot.year} ${lot.make.name} ${lot.model.name} — ${lot.source} ${lot.state ?? ''} | VitAuto`;
  const description = `${lot.year} ${lot.make.name} ${lot.model.name}. ${lot.damageType ?? ''} damage. Final bid: $${lot.finalBid ?? '—'}. Lot #${lot.lotNumber}.`;

  return {
    title,
    description,
    robots: isDemoMode ? 'noindex' : { index: true, follow: true },
    alternates: {
      canonical: `https://vitauto.ua/uk/cars/${id}`,
    },
    openGraph: {
      title,
      description,
      images: lot.photoUrls[0] ? [{ url: lot.photoUrls[0] }] : [],
    },
  };
}

export default async function LotDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const lot = await getLot(id);
  const t = await getTranslations({ locale, namespace: 'catalog' });

  if (!lot) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('breadcrumbHome'), item: `https://vitauto.ua/${locale}` },
      { '@type': 'ListItem', position: 2, name: t('breadcrumbCatalog'), item: `https://vitauto.ua/${locale}/cars` },
      { '@type': 'ListItem', position: 3, name: lot.make.name, item: `https://vitauto.ua/${locale}/cars?makeId=${lot.make.id}` },
      { '@type': 'ListItem', position: 4, name: lot.model.name, item: `https://vitauto.ua/${locale}/cars?makeId=${lot.make.id}&modelId=${lot.model.id}` },
      { '@type': 'ListItem', position: 5, name: `#${lot.lotNumber}`, item: `https://vitauto.ua/${locale}/cars/${id}` },
    ],
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <DemoDataBanner />
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/">{t('breadcrumbHome')}</Link>
          <span>/</span>
          <Link href="/cars">{t('breadcrumbCatalog')}</Link>
          <span>/</span>
          <Link href={`/cars?makeId=${lot.make.id}`}>{lot.make.name}</Link>
          <span>/</span>
          <Link href={`/cars?makeId=${lot.make.id}&modelId=${lot.model.id}`}>{lot.model.name}</Link>
          <span>/</span>
          <span className="text-foreground font-medium">#{lot.lotNumber}</span>
        </nav>

        <LotDetailClient lot={lot} />
      </div>
    </main>
  );
}
