'use client';

import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { LotCardDto } from '@vitauto/shared-types';
import { Car, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface LotCardProps {
  lot: LotCardDto;
}

function inferCarSize(bodyType: string | null): 'small' | 'big' {
  if (!bodyType) return 'small';
  const big = ['suv', 'truck', 'minivan', 'wagon', 'van'];
  return big.some((b) => bodyType.toLowerCase().includes(b)) ? 'big' : 'small';
}

export function LotCard({ lot }: LotCardProps) {
  const t = useTranslations('catalog');
  const locale = useLocale();

  const firstPhoto = lot.photoUrls[0] ?? null;
  const price = lot.finalBid
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(lot.finalBid)
    : '—';

  const saleDate = lot.saleDate
    ? new Date(lot.saleDate).toLocaleDateString(locale === 'uk' ? 'uk-UA' : 'en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  const calcParams = new URLSearchParams({
    make: lot.make.name,
    model: lot.model.name,
    year: String(lot.year),
    ...(lot.finalBid ? { lotPrice: String(Math.round(lot.finalBid)) } : {}),
    carSize: inferCarSize(lot.bodyType),
  });
  const calcUrl = `/${locale}/calculator?${calcParams.toString()}`;

  return (
    <div className="group rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="relative aspect-video bg-muted overflow-hidden">
        {firstPhoto ? (
          <Image
            src={firstPhoto}
            alt={`${lot.make.name} ${lot.model.name} ${lot.year}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Car className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <Badge variant="secondary" className="text-xs font-semibold">
            {lot.source}
          </Badge>
          {lot.damageType && (
            <Badge variant="outline" className="text-xs bg-background/80">
              {lot.damageType}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-base leading-tight">
            {lot.year} {lot.make.name} {lot.model.name}
          </h3>
          {lot.state && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" />
              {lot.state}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">{price}</span>
          {saleDate && (
            <span className="text-xs text-muted-foreground">
              {t('sold')} {saleDate}
            </span>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <Link href={`/cars/${lot.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              {t('details')}
            </Button>
          </Link>
          <a href={calcUrl} className="flex-1">
            <Button size="sm" className="w-full">
              {t('calculate')}
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
