'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Search, Hammer, Ship, FileCheck, Wrench, Car } from 'lucide-react';
import HowItWorksStep from './HowItWorksStep';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const STEPS = [
  { num: 1, Icon: Search },
  { num: 2, Icon: Hammer },
  { num: 3, Icon: Ship },
  { num: 4, Icon: FileCheck },
  { num: 5, Icon: Wrench },
  { num: 6, Icon: Car },
] as const;

type StepNum = (typeof STEPS)[number]['num'];

export default function HowItWorksSection() {
  const t = useTranslations('Landing.howItWorks');

  return (
    <section id="how-it-works" className="bg-muted/30 py-16 md:py-24">
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
          {STEPS.map(({ num, Icon }) => (
            <HowItWorksStep
              key={num}
              number={String(num).padStart(2, '0')}
              icon={<Icon className="h-5 w-5" />}
              title={t(`step${num as StepNum}Title`)}
              duration={t(`step${num as StepNum}Duration`)}
              description={t(`step${num as StepNum}Desc`)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
