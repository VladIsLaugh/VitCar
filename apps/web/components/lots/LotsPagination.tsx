'use client';

import { useRouter, usePathname } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface LotsPaginationProps {
  currentPage: number;
  totalPages: number;
}

function buildPages(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: Array<number | 'ellipsis'> = [1];

  if (current > 3) pages.push('ellipsis');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('ellipsis');

  pages.push(total);
  return pages;
}

export function LotsPagination({ currentPage, totalPages }: LotsPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const pages = buildPages(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`ellipsis-${i}`} className="px-2">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </span>
        ) : (
          <Button
            key={p}
            variant={p === currentPage ? 'default' : 'outline'}
            size="icon"
            className="h-9 w-9"
            onClick={() => goToPage(p)}
          >
            {p}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
