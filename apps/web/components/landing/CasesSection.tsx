'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import CaseCard from './CaseCard';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function CasesSection() {
  const t = useTranslations('Landing.cases');

  const specs = [
    { label: t('item1SpecLabel1'), value: t('item1SpecValue1') },
    { label: t('item1SpecLabel2'), value: t('item1SpecValue2') },
    { label: t('item1SpecLabel3'), value: t('item1SpecValue3') },
    { label: t('item1SpecLabel4'), value: t('item1SpecValue4') },
  ];

  return (
    <section id="cases" className="bg-muted/30 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {t('title')}
        </h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <CaseCard
            title={t('item1Title')}
            badge={t('item1Badge')}
            beforePhotoUrl={null}
            specs={specs}
            finalPrice={t('item1FinalPrice')}
            quote={t('item1Quote')}
            clientName={t('item1ClientName')}
            clientCity={t('item1ClientCity')}
            photoPlaceholder={t('photoPlaceholder')}
          />
        </motion.div>
      </div>
    </section>
  );
}
