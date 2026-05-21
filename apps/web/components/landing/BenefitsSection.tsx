'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ShieldCheck, Camera, TrendingUp, UserCheck, Wrench, MapPin } from 'lucide-react';
import BenefitCard from './BenefitCard';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const BENEFITS = [
  { num: 1, Icon: ShieldCheck },
  { num: 2, Icon: Camera },
  { num: 3, Icon: TrendingUp },
  { num: 4, Icon: UserCheck },
  { num: 5, Icon: Wrench },
  { num: 6, Icon: MapPin },
] as const;

type ItemNum = (typeof BENEFITS)[number]['num'];

export default function BenefitsSection() {
  const t = useTranslations('Landing.benefits');

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {t('title')}
        </h2>

        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {BENEFITS.map(({ num, Icon }) => (
            <BenefitCard
              key={num}
              icon={<Icon className="h-5 w-5" />}
              title={t(`item${num as ItemNum}Title`)}
              description={t(`item${num as ItemNum}Desc`)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
