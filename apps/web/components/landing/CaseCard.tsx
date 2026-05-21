'use client';

import { motion } from 'framer-motion';

interface Spec {
  label: string;
  value: string;
}

interface Props {
  title: string;
  badge: string;
  beforePhotoUrl: string | null;
  specs: Spec[];
  finalPrice: string;
  quote: string;
  clientName: string;
  clientCity: string;
  photoPlaceholder: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function CaseCard({
  title,
  badge,
  beforePhotoUrl,
  specs,
  finalPrice,
  quote,
  clientName,
  clientCity,
  photoPlaceholder,
}: Props) {
  return (
    <motion.div
      variants={itemVariants}
      className="overflow-hidden rounded-2xl border border-border bg-card"
    >
      <div className="flex flex-col lg:flex-row">
        {/* Photo */}
        <div className="lg:w-2/5 lg:shrink-0">
          {beforePhotoUrl ? (
            <img src={beforePhotoUrl} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex aspect-video h-full w-full items-center justify-center rounded-none bg-neutral-100 text-sm text-muted-foreground dark:bg-neutral-800 lg:aspect-auto lg:min-h-64">
              {photoPlaceholder}
            </div>
          )}
        </div>

        {/* Data */}
        <div className="flex flex-1 flex-col gap-5 p-6 lg:p-8">
          <div>
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
            <span className="mt-1 inline-flex rounded-full bg-[#0A2540]/10 px-3 py-0.5 text-xs font-medium text-[#0A2540] dark:bg-[#1B4F8A]/20 dark:text-[#34D399]">
              {badge}
            </span>
          </div>

          {/* Specs table */}
          <div className="divide-y divide-border rounded-lg border border-border">
            {specs.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-semibold tabular-nums text-foreground">{value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between bg-[#10B981]/5 px-4 py-3">
              <span className="text-sm font-semibold text-foreground">Total turnkey</span>
              <span className="text-base font-bold text-[#10B981]">{finalPrice}</span>
            </div>
          </div>

          {/* Quote */}
          <blockquote className="border-l-2 border-[#10B981] pl-4 text-sm italic leading-relaxed text-muted-foreground">
            &ldquo;{quote}&rdquo;
            <footer className="mt-1 not-italic font-medium text-foreground">
              — {clientName}, {clientCity}
            </footer>
          </blockquote>
        </div>
      </div>
    </motion.div>
  );
}
