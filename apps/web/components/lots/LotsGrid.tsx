'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import type { LotCardDto, LotListResponseDto } from '@vitauto/shared-types';
import { LotCard } from './LotCard';
import { LotCardSkeleton } from './LotCardSkeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LotsGridProps {
  data: LotListResponseDto | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function LotsGrid({ data, isLoading, isError, onRetry }: LotsGridProps) {
  const t = useTranslations('catalog');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sortBy = searchParams.get('sortBy') ?? 'saleDate_desc';

  const updateSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', value);
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`);
  };

  const skeletons: LotCardDto[] = [];
  const skeletonCount = 24;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <p className="text-muted-foreground">{t('errorTitle')}</p>
        <Button variant="outline" onClick={onRetry}>{t('retry')}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        {data && (
          <p className="text-sm text-muted-foreground">
            {t('showing', { shown: data.items.length, total: data.total })}
          </p>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <Select value={sortBy} onValueChange={updateSort}>
            <SelectTrigger className="h-8 w-[160px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="saleDate_desc">{t('sortNewest')}</SelectItem>
              <SelectItem value="price_asc">{t('sortCheapest')}</SelectItem>
              <SelectItem value="price_desc">{t('sortExpensive')}</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={t('gridView')}>
            <LayoutGrid className="h-4 w-4" />
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-40 cursor-not-allowed" disabled>
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('comingSoon')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <LotCardSkeleton key={i} />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <p className="font-medium">{t('emptyTitle')}</p>
          <p className="text-sm text-muted-foreground">{t('emptyHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.items.map((lot) => (
            <LotCard key={lot.id} lot={lot} />
          ))}
        </div>
      )}
    </div>
  );
}
