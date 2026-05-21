'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface FaqItem {
  question: string;
  answer: string;
}

export default function FaqSection() {
  const t = useTranslations('Landing.faq');
  const items = t.raw('items') as FaqItem[];

  return (
    <section id="faq" className="bg-muted/30 py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="mb-3 text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t('title')}
          </h2>
          <p className="mb-10 text-center text-base text-muted-foreground">{t('subtitle')}</p>

          <Accordion type="single" collapsible className="w-full">
            {items.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:no-underline hover:text-[#10B981]">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
