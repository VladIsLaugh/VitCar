'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface Props {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function BenefitCard({ icon, title, description }: Props) {
  return (
    <motion.div
      variants={itemVariants}
      className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-[#10B981]/40 hover:shadow-lg"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#10B981]/10 text-[#10B981] transition-colors duration-200 group-hover:bg-[#10B981] group-hover:text-white">
        {icon}
      </div>

      <div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}
