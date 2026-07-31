'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { apiClient } from '@/lib/api-client';
import type { VinDecodeResultDto } from '@vitauto/shared-types';
import { Skeleton } from '@/components/ui/skeleton';

interface LotVinInfoProps {
  vin: string;
}

export function LotVinInfo({ vin }: LotVinInfoProps) {
  const t = useTranslations('catalog');

  const { data: vinData, isLoading } = useQuery<VinDecodeResultDto>({
    queryKey: ['vin', vin],
    queryFn: () =>
      apiClient.get<VinDecodeResultDto>(`/vehicles/vin/${vin}`).then((r) => r.data),
    staleTime: 30 * 24 * 60 * 60 * 1000,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-40" />
      </div>
    );
  }

  if (!vinData?.make) return null;

  return (
    <div className="rounded-xl border border-border p-4 space-y-2">
      <h3 className="font-semibold text-sm">{t('vinInfo')}</h3>
      <dl className="text-sm space-y-1">
        {vinData.make && (
          <div className="flex gap-2">
            <dt className="text-muted-foreground w-32">Make</dt>
            <dd>{vinData.make}</dd>
          </div>
        )}
        {vinData.model && (
          <div className="flex gap-2">
            <dt className="text-muted-foreground w-32">Model</dt>
            <dd>{vinData.model}</dd>
          </div>
        )}
        {vinData.year && (
          <div className="flex gap-2">
            <dt className="text-muted-foreground w-32">Year</dt>
            <dd>{vinData.year}</dd>
          </div>
        )}
        {vinData.fuelType && (
          <div className="flex gap-2">
            <dt className="text-muted-foreground w-32">Fuel</dt>
            <dd>{vinData.fuelType}</dd>
          </div>
        )}
        {vinData.batteryKwh && (
          <div className="flex gap-2">
            <dt className="text-muted-foreground w-32">Battery</dt>
            <dd>{vinData.batteryKwh} kWh</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
