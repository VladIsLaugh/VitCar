'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';

export default function CtaBandSection() {
  const t = useTranslations('Landing.ctaBand');
  const router = useRouter();
  const [makeModel, setMakeModel] = useState('');
  const [lotPrice, setLotPrice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (makeModel.trim()) params.set('make', makeModel.trim());
    if (lotPrice.trim()) params.set('lotPrice', lotPrice.trim());
    const qs = params.toString();
    router.push(`/calculator${qs ? `?${qs}` : ''}`);
  };

  return (
    <section id="calculator" className="bg-[#0A2540] py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        {/* Badge */}
        <div className="mb-5 text-center">
          <span className="inline-flex items-center rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-1 text-xs font-semibold tracking-wide text-[#10B981]">
            {t('badge')}
          </span>
        </div>

        {/* Heading */}
        <h2 className="mb-3 text-center text-3xl font-bold tracking-tight text-white md:text-4xl">
          {t('title')}
        </h2>
        <p className="mb-10 text-center text-sm text-white/60 md:text-base">{t('subtitle')}</p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-xs font-medium text-white/60">{t('makeModelLabel')}</label>
              <input
                type="text"
                value={makeModel}
                onChange={(e) => setMakeModel(e.target.value)}
                placeholder={t('makeModelPlaceholder')}
                className="rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981]"
              />
            </div>

            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-xs font-medium text-white/60">{t('lotPriceLabel')}</label>
              <input
                type="number"
                value={lotPrice}
                onChange={(e) => setLotPrice(e.target.value)}
                placeholder={t('lotPricePlaceholder')}
                min={0}
                className="rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>

            <button
              type="submit"
              className="shrink-0 rounded-lg bg-[#10B981] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#059669] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#10B981] sm:self-end"
            >
              {t('submitButton')}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
