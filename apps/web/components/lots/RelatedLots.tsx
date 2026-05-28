import { useTranslations } from 'next-intl';
import type { LotCardDto } from '@vitauto/shared-types';
import { LotCard } from './LotCard';

interface RelatedLotsProps {
  lots: LotCardDto[];
}

export function RelatedLots({ lots }: RelatedLotsProps) {
  const t = useTranslations('catalog');

  if (lots.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">{t('relatedLots')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {lots.map((lot) => (
          <LotCard key={lot.id} lot={lot} />
        ))}
      </div>
    </section>
  );
}
