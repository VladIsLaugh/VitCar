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

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Landing' });
  const faqItems = t.raw('faq.items') as Array<{ question: string; answer: string }>;

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'VitAuto',
    url: 'https://vitauto.ua',
    logo: 'https://vitauto.ua/logo.png',
    sameAs: ['https://vitauto.ua'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Ukrainian', 'English'],
    },
  };

  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'VitAuto',
    url: 'https://vitauto.ua',
    description: t('meta.description'),
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'UA',
    },
    priceRange: '$$',
    currenciesAccepted: 'USD, UAH',
    openingHours: 'Mo-Fr 09:00-18:00',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />
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
