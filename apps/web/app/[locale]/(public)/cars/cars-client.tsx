'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { LotListResponseDto, MakeDto, ModelDto } from '@vitauto/shared-types';
import { LotFilters } from '@/components/lots/LotFilters';
import { LotsGrid } from '@/components/lots/LotsGrid';
import { LotsPagination } from '@/components/lots/LotsPagination';

interface CarsClientProps {
  initialMakes: MakeDto[];
}

export function CarsClient({ initialMakes }: CarsClientProps) {
  const searchParams = useSearchParams();

  const filters: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    filters[key] = value;
  });

  const makeId = filters.makeId;

  const { data: models = [] } = useQuery<ModelDto[]>({
    queryKey: ['models', makeId],
    queryFn: () =>
      apiClient.get<ModelDto[]>(`/makes/${makeId}/models`).then((r) => r.data),
    enabled: !!makeId,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const queryString = searchParams.toString();
  const { data, isLoading, isError, refetch } = useQuery<LotListResponseDto>({
    queryKey: ['lots', queryString],
    queryFn: () =>
      apiClient.get<LotListResponseDto>(`/lots?${queryString}`).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const currentPage = Number(filters.page ?? '1');

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-64 shrink-0">
        <LotFilters makes={initialMakes} models={models} currentFilters={filters} />
      </div>

      <div className="flex-1 min-w-0 space-y-6">
        <LotsGrid
          data={data}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
        />
        {data && (
          <LotsPagination currentPage={currentPage} totalPages={data.totalPages} />
        )}
      </div>
    </div>
  );
}
