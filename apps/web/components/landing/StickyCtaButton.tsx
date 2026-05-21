'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function StickyCtaButton() {
  const t = useTranslations('Landing');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 300;
      const ctaBand = document.getElementById('calculator');
      const ctaVisible = ctaBand ? ctaBand.getBoundingClientRect().top < window.innerHeight : false;
      setVisible(scrolled && !ctaVisible);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <Link
        href="/calculator"
        className="block w-full bg-[#10B981] py-4 text-center text-base font-semibold text-white transition-colors hover:bg-[#059669]"
      >
        {t('stickyCtaButton')}
      </Link>
    </div>
  );
}
