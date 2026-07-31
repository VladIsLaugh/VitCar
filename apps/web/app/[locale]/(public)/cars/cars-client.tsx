'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { LotListResponseDto, MakeDto } from '@vitauto/shared-types';
import { LotFilters } from '@/components/lots/LotFilters';
import { LotFiltersDrawer } from '@/components/lots/LotFiltersDrawer';
import { LotsGrid } from '@/components/lots/LotsGrid';
import { LotsPagination } from '@/components/lots/LotsPagination';

interface CarsClientProps {
  initialMakes: MakeDto[];
}

export function CarsClient({ initialMakes }: CarsClientProps) {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const { data, isLoading, isError, refetch } = useQuery<LotListResponseDto>({
    queryKey: ['lots', queryString],
    queryFn: () => apiClient.get<LotListResponseDto>(`/lots?${queryString}`).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const currentPage = Number(searchParams.get('page') ?? '1');

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <LotFilters makes={initialMakes} facets={data?.facets} />
      </div>

      {/* Mobile drawer trigger */}
      <div className="lg:hidden">
        <LotFiltersDrawer makes={initialMakes} facets={data?.facets} total={data?.total} />
      </div>

      <div className="flex-1 min-w-0 space-y-6">
        <LotsGrid
          data={data}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
        />
        {data && <LotsPagination currentPage={currentPage} totalPages={data.totalPages} />}
      </div>
    </div>
  );
}
