import type { Metadata } from 'next';
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
  const isUk = locale === 'uk';

  return {
    title: isUk
      ? 'VitAuto — Авто з аукціонів США під ключ | Прозора ціна до копійки'
      : 'VitAuto — Cars from US Auctions, Turnkey | Transparent Price to the Penny',
    description: isUk
      ? 'Повний цикл імпорту авто з аукціонів Copart та IAAI. Прозорий розрахунок усіх витрат до копійки до покупки лота.'
      : 'Full-cycle import of cars from Copart and IAAI auctions. Transparent breakdown of all costs to the penny before buying the lot.',
    openGraph: {
      images: ['/og-landing.jpg'],
      type: 'website',
      locale: isUk ? 'uk_UA' : 'en_US',
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
