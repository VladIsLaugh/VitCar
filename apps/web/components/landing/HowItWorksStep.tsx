'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface Props {
  number: string;
  icon: ReactNode;
  title: string;
  duration: string;
  description: string;
}

export default function HowItWorksStep({ number, icon, title, duration, description }: Props) {
  return (
    <motion.div
      variants={itemVariants}
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A2540] text-white dark:bg-[#1B4F8A]">
          {icon}
        </div>
        <span className="text-4xl font-bold text-muted-foreground/20 select-none">{number}</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <span className="inline-flex w-fit rounded-full bg-[#10B981]/10 px-2.5 py-0.5 text-xs font-medium text-[#10B981]">
          {duration}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </motion.div>
  );
}
