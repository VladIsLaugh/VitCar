'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { apiClient } from '@/lib/api-client';
import type { MakeDto, ModelDto, LotFacetsDto } from '@vitauto/shared-types';

interface LotFiltersProps {
  makes: MakeDto[];
  facets?: LotFacetsDto;
}

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

const US_STATES = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
];

const YEAR_MIN = 1990;
const YEAR_MAX = new Date().getFullYear() + 1;
const PRICE_MIN = 0;
const PRICE_MAX = 50000;
const MILEAGE_MAX = 300000;

export function LotFilters({ makes, facets }: LotFiltersProps) {
  const t = useTranslations('catalog');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── Read current filter values from URL ──────────────────────────────
  const makeId = searchParams.get('makeId') ?? '';
  const modelId = searchParams.get('modelId') ?? '';
  const yearFrom = Number(searchParams.get('yearFrom') ?? YEAR_MIN);
  const yearTo = Number(searchParams.get('yearTo') ?? YEAR_MAX);
  const priceFrom = Number(searchParams.get('priceFrom') ?? PRICE_MIN);
  const priceTo = Number(searchParams.get('priceTo') ?? PRICE_MAX);
  const mileageMax = Number(searchParams.get('mileageMax') ?? MILEAGE_MAX);
  const sourceParam = searchParams.get('source') ?? '';
  const damageTypeParam = searchParams.get('damageType') ?? '';
  const fuelTypeParam = searchParams.get('fuelType') ?? '';
  const stateParam = searchParams.get('state') ?? '';
  const saleDateRange = searchParams.get('saleDateRange') ?? 'any';

  // ── Local slider state (debounced) ────────────────────────────────────
  const [localYear, setLocalYear] = useState<[number, number]>([yearFrom, yearTo]);
  const [localPrice, setLocalPrice] = useState<[number, number]>([priceFrom, priceTo]);
  const [localMileage, setLocalMileage] = useState<number>(mileageMax);

  // Stable refs so debounced effects don't need router/pathname/searchParams as deps
  const routerRef = useRef(router);
  const pathnameRef = useRef(pathname);
  const searchParamsRef = useRef(searchParams);
  routerRef.current = router;
  pathnameRef.current = pathname;
  searchParamsRef.current = searchParams;

  // Sync local state when URL changes externally
  useEffect(() => {
    setLocalYear([yearFrom, yearTo]);
  }, [yearFrom, yearTo]);

  useEffect(() => {
    setLocalPrice([priceFrom, priceTo]);
  }, [priceFrom, priceTo]);

  useEffect(() => {
    setLocalMileage(mileageMax);
  }, [mileageMax]);

  // ── Debounced slider commits ──────────────────────────────────────────
  useEffect(() => {
    const id = setTimeout(() => {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      if (localYear[0] !== YEAR_MIN) {
        params.set('yearFrom', String(localYear[0]));
      } else {
        params.delete('yearFrom');
      }
      if (localYear[1] !== YEAR_MAX) {
        params.set('yearTo', String(localYear[1]));
      } else {
        params.delete('yearTo');
      }
      params.delete('page');
      routerRef.current.replace(`${pathnameRef.current}?${params.toString()}`, {
        scroll: false,
      });
    }, 300);
    return () => clearTimeout(id);
  }, [localYear]);

  useEffect(() => {
    const id = setTimeout(() => {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      if (localPrice[0] !== PRICE_MIN) {
        params.set('priceFrom', String(localPrice[0]));
      } else {
        params.delete('priceFrom');
      }
      if (localPrice[1] !== PRICE_MAX) {
        params.set('priceTo', String(localPrice[1]));
      } else {
        params.delete('priceTo');
      }
      params.delete('page');
      routerRef.current.replace(`${pathnameRef.current}?${params.toString()}`, {
        scroll: false,
      });
    }, 300);
    return () => clearTimeout(id);
  }, [localPrice]);

  useEffect(() => {
    const id = setTimeout(() => {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      if (localMileage !== MILEAGE_MAX) {
        params.set('mileageMax', String(localMileage));
      } else {
        params.delete('mileageMax');
      }
      params.delete('page');
      routerRef.current.replace(`${pathnameRef.current}?${params.toString()}`, {
        scroll: false,
      });
    }, 300);
    return () => clearTimeout(id);
  }, [localMileage]);

  // ── Generic filter update ─────────────────────────────────────────────
  const updateFilter = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset dependent filters
      if (key === 'makeId') {
        params.delete('modelId');
      }
      params.delete('page');
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const clearAll = useCallback(() => {
    setLocalYear([YEAR_MIN, YEAR_MAX]);
    setLocalPrice([PRICE_MIN, PRICE_MAX]);
    setLocalMileage(MILEAGE_MAX);
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  // ── Checkbox toggle helpers ───────────────────────────────────────────
  const toggleCheckboxFilter = useCallback(
    (key: string, value: string) => {
      updateFilter(key, value === searchParams.get(key) ? undefined : value);
    },
    [searchParams, updateFilter]
  );

  // ── Models query ──────────────────────────────────────────────────────
  const { data: models = [] } = useQuery<ModelDto[]>({
    queryKey: ['models', makeId],
    queryFn: () => apiClient.get<ModelDto[]>(`/makes/${makeId}/models`).then((r) => r.data),
    enabled: !!makeId,
    staleTime: 24 * 60 * 60 * 1000,
  });

  // ── Active filter count ───────────────────────────────────────────────
  const activeCount = FILTER_KEYS.filter((k) => {
    if (k === 'saleDateRange') return searchParams.get(k) && searchParams.get(k) !== 'any';
    return !!searchParams.get(k);
  }).length;

  const saleDateOptions = [
    { value: 'any', label: t('filters.saleDateOptions.any') },
    { value: 'week', label: t('filters.saleDateOptions.week') },
    { value: 'month', label: t('filters.saleDateOptions.month') },
    { value: 'threeMonths', label: t('filters.saleDateOptions.threeMonths') },
    { value: 'year', label: t('filters.saleDateOptions.year') },
  ];

  return (
    <aside className="sticky top-[80px] w-[280px] shrink-0 space-y-5 self-start">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          {activeCount > 0
            ? t('filters.activeCount', { count: activeCount })
            : t('filters.drawerTitle')}
        </span>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs h-7 px-2">
            {t('filters.resetAll')}
          </Button>
        )}
      </div>

      {/* Make */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">{t('filters.makeLabel')}</Label>
        <Select
          value={makeId || 'all'}
          onValueChange={(v) => updateFilter('makeId', v === 'all' ? undefined : v)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder={t('filters.allMakes')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.allMakes')}</SelectItem>
            {makes.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name} ({m.lotCount})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Model — only when makeId is set */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">{t('filters.modelLabel')}</Label>
        <Select
          value={modelId || 'all'}
          onValueChange={(v) => updateFilter('modelId', v === 'all' ? undefined : v)}
          disabled={!makeId}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder={t('filters.allModels')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.allModels')}</SelectItem>
            {models.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name} ({m.lotCount})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Year range slider */}
      <div className="space-y-2.5">
        <Label className="text-xs font-medium">{t('filters.yearLabel')}</Label>
        <Slider
          min={YEAR_MIN}
          max={YEAR_MAX}
          step={1}
          value={localYear}
          onValueChange={(v) => setLocalYear(v as [number, number])}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{localYear[0]}</span>
          <span>{localYear[1]}</span>
        </div>
      </div>

      {/* Price range slider */}
      <div className="space-y-2.5">
        <Label className="text-xs font-medium">{t('filters.priceLabel')}</Label>
        <Slider
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={500}
          value={localPrice}
          onValueChange={(v) => setLocalPrice(v as [number, number])}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>${localPrice[0].toLocaleString()}</span>
          <span>${localPrice[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Mileage slider */}
      <div className="space-y-2.5">
        <Label className="text-xs font-medium">{t('filters.mileageLabel')}</Label>
        <Slider
          min={0}
          max={MILEAGE_MAX}
          step={5000}
          value={[localMileage]}
          onValueChange={(v) => setLocalMileage(v[0])}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>{localMileage.toLocaleString()} mi</span>
        </div>
      </div>

      {/* Auction source */}
      {facets?.sources && facets.sources.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs font-medium">{t('filters.sourceLabel')}</Label>
          <div className="space-y-1.5">
            {facets.sources.map(({ value, count }) => (
              <div key={value} className="flex items-center gap-2">
                <Checkbox
                  id={`source-${value}`}
                  checked={sourceParam === value}
                  onCheckedChange={() => toggleCheckboxFilter('source', value)}
                />
                <label
                  htmlFor={`source-${value}`}
                  className="text-sm cursor-pointer flex-1 flex justify-between"
                >
                  <span>{value}</span>
                  <span className="text-muted-foreground text-xs">{count}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Damage type */}
      {facets?.damageTypes && facets.damageTypes.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs font-medium">{t('filters.damageTypeLabel')}</Label>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {facets.damageTypes.map(({ value, count }) => (
              <div key={value} className="flex items-center gap-2">
                <Checkbox
                  id={`damage-${value}`}
                  checked={damageTypeParam === value}
                  onCheckedChange={() => toggleCheckboxFilter('damageType', value)}
                />
                <label
                  htmlFor={`damage-${value}`}
                  className="text-sm cursor-pointer flex-1 flex justify-between"
                >
                  <span>{value}</span>
                  <span className="text-muted-foreground text-xs">{count}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fuel type */}
      {facets?.fuelTypes && facets.fuelTypes.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs font-medium">{t('filters.fuelTypeLabel')}</Label>
          <div className="space-y-1.5">
            {facets.fuelTypes
              .filter((f) => f.value !== null)
              .map(({ value, count }) => (
                <div key={value} className="flex items-center gap-2">
                  <Checkbox
                    id={`fuel-${value}`}
                    checked={fuelTypeParam === value}
                    onCheckedChange={() => toggleCheckboxFilter('fuelType', value as string)}
                  />
                  <label
                    htmlFor={`fuel-${value}`}
                    className="text-sm cursor-pointer flex-1 flex justify-between"
                  >
                    <span>{value}</span>
                    <span className="text-muted-foreground text-xs">{count}</span>
                  </label>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* State */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">{t('filters.stateLabel')}</Label>
        <Select
          value={stateParam || 'all'}
          onValueChange={(v) => updateFilter('state', v === 'all' ? undefined : v)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder={t('filters.allStates')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.allStates')}</SelectItem>
            {US_STATES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sale date */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">{t('filters.saleDateLabel')}</Label>
        <RadioGroup
          value={saleDateRange}
          onValueChange={(v) => updateFilter('saleDateRange', v === 'any' ? undefined : v)}
          className="space-y-1.5"
        >
          {saleDateOptions.map(({ value, label }) => (
            <div key={value} className="flex items-center gap-2">
              <RadioGroupItem value={value} id={`sale-date-${value}`} />
              <label htmlFor={`sale-date-${value}`} className="text-sm cursor-pointer">
                {label}
              </label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </aside>
  );
}
