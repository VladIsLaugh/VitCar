import type { MetadataRoute } from 'next';

const BASE_URL = 'https://vitauto.ua';
const LOCALES = ['uk', 'en'] as const;
const API_URL = process.env.API_URL ?? 'http://localhost:3001/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/cars', priority: 0.8, changeFrequency: 'daily' },
    { path: '/calculator', priority: 0.7, changeFrequency: 'monthly' },
  ];

  const staticUrls: MetadataRoute.Sitemap = staticPages.flatMap((page) =>
    LOCALES.map((locale) => ({
      url: `${BASE_URL}/${locale}${page.path}`,
      lastModified: new Date(),
      priority: locale === 'uk' ? page.priority : page.priority - 0.1,
      changeFrequency: page.changeFrequency,
    })),
  );

  let lotUrls: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/lots?limit=10000&sortBy=saleDate_desc`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = (await res.json()) as { items: Array<{ id: string; scrapedAt: string }> };
      lotUrls = data.items.flatMap((lot) =>
        LOCALES.map((locale) => ({
          url: `${BASE_URL}/${locale}/cars/${lot.id}`,
          lastModified: new Date(lot.scrapedAt),
          priority: 0.6,
          changeFrequency: 'yearly' as const,
        })),
      );
    }
  } catch {
    // API unavailable — return static only
  }

  return [...staticUrls, ...lotUrls];
}
