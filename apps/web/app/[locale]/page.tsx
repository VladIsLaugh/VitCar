import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import HeroSection from '@/components/landing/HeroSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import BenefitsSection from '@/components/landing/BenefitsSection';
import CasesSection from '@/components/landing/CasesSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import FaqSection from '@/components/landing/FaqSection';
import CtaBandSection from '@/components/landing/CtaBandSection';
import StickyCtaButton from '@/components/landing/StickyCtaButton';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Landing.meta' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      images: ['/og-landing.jpg'],
      type: 'website',
      locale: locale === 'uk' ? 'uk_UA' : 'en_US',
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default function HomePage() {
  return (
    <>
      <main className="min-h-screen bg-background text-foreground">
        <HeroSection />
        <HowItWorksSection />
        <BenefitsSection />
        <CasesSection />
        <TestimonialsSection />
        <FaqSection />
        <CtaBandSection />
      </main>
      <StickyCtaButton />
    </>
  );
}
