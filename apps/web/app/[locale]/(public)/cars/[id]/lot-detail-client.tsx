'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { LotDetailDto } from '@vitauto/shared-types';
import { LotPhotoGallery } from '@/components/lots/LotPhotoGallery';
import { LotSpecTable } from '@/components/lots/LotSpecTable';
import { LotVinInfo } from '@/components/lots/LotVinInfo';
import { LotCalculateBlock } from '@/components/lots/LotCalculateBlock';
import { RelatedLots } from '@/components/lots/RelatedLots';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { trackEvent } from '@/lib/analytics';

interface LotDetailClientProps {
  lot: LotDetailDto;
}

export function LotDetailClient({ lot }: LotDetailClientProps) {
  const t = useTranslations('catalog');

  useEffect(() => {
    trackEvent('lot_viewed', { lotId: lot.id, make: lot.make.name, model: lot.model.name });
  }, [lot.id, lot.make.name, lot.model.name]);

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t('linkCopied'));
    }
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <LotPhotoGallery
            photoUrls={lot.photoUrls}
            alt={`${lot.year} ${lot.make.name} ${lot.model.name}`}
          />

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {lot.year} {lot.make.name} {lot.model.name}
            </h1>
            <Button variant="outline" size="sm" onClick={() => void share()} className="gap-2">
              <Share2 className="h-4 w-4" />
              {t('share')}
            </Button>
          </div>

          <LotSpecTable lot={lot} />
          {lot.vin && <LotVinInfo vin={lot.vin} />}
        </div>

        <div className="lg:col-span-1">
          <LotCalculateBlock lot={lot} />
        </div>
      </div>

      <RelatedLots lots={lot.relatedLots} />
    </div>
  );
}
