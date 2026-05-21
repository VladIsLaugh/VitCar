'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import TestimonialCard from './TestimonialCard';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function TestimonialsSection() {
  const t = useTranslations('Landing.testimonials');

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {t('title')}
        </h2>

        <motion.div
          className="flex justify-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <TestimonialCard
            name={t('item1Name')}
            city={t('item1City')}
            initials={t('item1Initials')}
            avatarUrl={null}
            text={t('item1Text')}
          />
        </motion.div>
      </div>
    </section>
  );
}
