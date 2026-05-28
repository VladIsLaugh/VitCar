'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { MakeDto, ModelDto } from '@vitauto/shared-types';

interface LotFiltersProps {
  makes: MakeDto[];
  models: ModelDto[];
  currentFilters: Record<string, string>;
}

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

export function LotFilters({ makes, models, currentFilters }: LotFiltersProps) {
  const t = useTranslations('catalog');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('page');
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const clearAll = () => {
    router.replace(pathname);
  };

  return (
    <aside className="space-y-5 w-full">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Filters
        </span>
        <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs h-7">
          {t('clearFilters')}
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">{t('filtersMake')}</Label>
        <Select value={currentFilters.makeId ?? 'all'} onValueChange={(v) => updateFilter('makeId', v)}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder={t('filtersAll')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filtersAll')}</SelectItem>
            {makes.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name} ({m.lotCount})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {models.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs">{t('filtersModel')}</Label>
          <Select value={currentFilters.modelId ?? 'all'} onValueChange={(v) => updateFilter('modelId', v)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder={t('filtersAll')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filtersAll')}</SelectItem>
              {models.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name} ({m.lotCount})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-xs">{t('filtersYear')}</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="From"
            className="h-9"
            defaultValue={currentFilters.yearFrom ?? ''}
            onBlur={(e) => updateFilter('yearFrom', e.target.value || undefined)}
            min={1990}
            max={2025}
          />
          <Input
            type="number"
            placeholder="To"
            className="h-9"
            defaultValue={currentFilters.yearTo ?? ''}
            onBlur={(e) => updateFilter('yearTo', e.target.value || undefined)}
            min={1990}
            max={2025}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">{t('filtersSource')}</Label>
        <Select value={currentFilters.source ?? 'all'} onValueChange={(v) => updateFilter('source', v)}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder={t('filtersAll')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filtersAll')}</SelectItem>
            <SelectItem value="COPART">Copart</SelectItem>
            <SelectItem value="IAAI">IAAI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">{t('filtersState')}</Label>
        <Select value={currentFilters.state ?? 'all'} onValueChange={(v) => updateFilter('state', v)}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder={t('filtersAll')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filtersAll')}</SelectItem>
            {US_STATES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">{t('filtersPrice')}</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            className="h-9"
            defaultValue={currentFilters.priceFrom ?? ''}
            onBlur={(e) => updateFilter('priceFrom', e.target.value || undefined)}
            min={0}
          />
          <Input
            type="number"
            placeholder="Max"
            className="h-9"
            defaultValue={currentFilters.priceTo ?? ''}
            onBlur={(e) => updateFilter('priceTo', e.target.value || undefined)}
            min={0}
          />
        </div>
      </div>
    </aside>
  );
}
