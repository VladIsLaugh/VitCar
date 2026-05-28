'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/routing';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { LotFilters } from './LotFilters';
import type { MakeDto, LotFacetsDto } from '@vitauto/shared-types';

const FILTER_KEYS = [
  'makeId',
  'modelId',
  'yearFrom',
  'yearTo',
  'source',
  'damageType',
  'fuelType',
  'priceFrom',
  'priceTo',
  'mileageMax',
  'state',
  'saleDateRange',
] as const;

interface LotFiltersDrawerProps {
  makes: MakeDto[];
  facets?: LotFacetsDto;
  total?: number;
}

export function LotFiltersDrawer({ makes, facets, total }: LotFiltersDrawerProps) {
  const t = useTranslations('catalog');
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeCount = FILTER_KEYS.filter((k) => {
    if (k === 'saleDateRange') return searchParams.get(k) && searchParams.get(k) !== 'any';
    return !!searchParams.get(k);
  }).length;

  const handleReset = () => {
    router.replace(pathname, { scroll: false });
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-2">
        <SlidersHorizontal className="h-4 w-4" />
        {t('filters.triggerLabel', { count: activeCount })}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto flex flex-col">
          <SheetHeader>
            <SheetTitle>{t('filters.drawerTitle')}</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4">
            <LotFilters makes={makes} facets={facets} />
          </div>

          <SheetFooter className="flex flex-row gap-2 pt-4 border-t">
            <Button variant="outline" className="flex-1" onClick={handleReset}>
              {t('filters.resetAll')}
            </Button>
            <Button className="flex-1" onClick={() => setOpen(false)}>
              {total !== undefined
                ? t('filters.showResults', { count: total })
                : t('filters.drawerTitle')}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
