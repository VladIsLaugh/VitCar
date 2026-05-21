'use client';

import { motion } from 'framer-motion';

interface Props {
  name: string;
  city: string;
  initials: string;
  avatarUrl: string | null;
  text: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function TestimonialCard({ name, city, initials, avatarUrl, text }: Props) {
  return (
    <motion.div
      variants={itemVariants}
      className="mx-auto w-full max-w-2xl rounded-2xl border border-border bg-card p-8"
    >
      <blockquote className="text-base leading-relaxed text-foreground md:text-lg">
        &ldquo;{text}&rdquo;
      </blockquote>

      <div className="mt-6 flex items-center gap-4">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="h-12 w-12 rounded-full object-cover" />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0A2540] text-sm font-bold text-white dark:bg-[#1B4F8A]">
            {initials}
          </div>
        )}
        <div>
          <p className="font-semibold text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">{city}</p>
        </div>
      </div>
    </motion.div>
  );
}
