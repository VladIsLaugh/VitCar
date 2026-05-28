import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';
import { cookies } from 'next/headers';
import Script from 'next/script';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AuthProvider } from '@/contexts/auth-context';
import { QueryProvider } from '@/contexts/query-provider';
import { Toaster } from '@/components/ui/sonner';
import DraftMigrationListener from '@/components/auth/DraftMigrationListener';
import '../globals.css';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    metadataBase: new URL('https://vitauto.ua'),
    title: t('title'),
    description: t('description'),
    robots: { index: true, follow: true },
    openGraph: { siteName: 'VitAuto' },
    twitter: { card: 'summary_large_image' },
    alternates: {
      languages: {
        uk: 'https://vitauto.ua/uk',
        en: 'https://vitauto.ua/en',
        'x-default': 'https://vitauto.ua/uk',
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  const messages = await getMessages();
  const cookieStore = await cookies();
  const hasConsent = cookieStore.get('cookieConsent')?.value === 'accepted';

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geist.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            <QueryProvider>
              <AuthProvider>
                <DraftMigrationListener />
                <Header />
                {children}
                <Footer />
              </AuthProvider>
            </QueryProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
        <Toaster />
        {hasConsent && process.env.NEXT_PUBLIC_CLARITY_ID && (
          <Script
            id="clarity"
            strategy="afterInteractive"
            src={`https://www.clarity.ms/tag/${process.env.NEXT_PUBLIC_CLARITY_ID}`}
          />
        )}
        <SpeedInsights />
      </body>
    </html>
  );
}
