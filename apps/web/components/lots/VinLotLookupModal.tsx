'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LotCard } from './LotCard';
import { apiClient } from '@/lib/api-client';
import { useRouter } from '@/i18n/routing';
import type { LotLookupResponseDto } from '@vitauto/shared-types';

interface VinLotLookupModalProps {
  open: boolean;
  onClose: () => void;
}

const isVin = (input: string) => /^[A-Z0-9]{17}$/i.test(input);

export function VinLotLookupModal({ open, onClose }: VinLotLookupModalProps) {
  const t = useTranslations('catalog');
  const router = useRouter();
  const [input, setInput] = useState('');
  const [debouncedInput, setDebouncedInput] = useState('');

  useEffect(() => {
    if (!open) {
      setInput('');
      setDebouncedInput('');
    }
  }, [open]);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedInput(input.trim()), 400);
    return () => clearTimeout(id);
  }, [input]);

  const { data, isLoading, isError, refetch } = useQuery<LotLookupResponseDto>({
    queryKey: ['lot-lookup', debouncedInput],
    queryFn: () => {
      const params = isVin(debouncedInput)
        ? { vin: debouncedInput }
        : { lotNumber: debouncedInput };
      return apiClient.get<LotLookupResponseDto>('/lots/lookup', { params }).then((r) => r.data);
    },
    enabled: debouncedInput.length >= 5,
    staleTime: 60 * 1000,
  });

  const hint =
    debouncedInput.length >= 5
      ? isVin(debouncedInput)
        ? t('lookup.searchingByVin')
        : t('lookup.searchingByLot')
      : null;

  const handleLotClick = (id: string) => {
    router.push(`/cars/${id}`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('lookup.modalTitle')}</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('lookup.inputPlaceholder')}
            className="pr-10"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}

        {isError && (
          <div className="flex items-center gap-3 text-sm text-destructive">
            <span>{t('lookup.errorMessage')}</span>
            <Button size="sm" variant="outline" onClick={() => void refetch()}>
              {t('lookup.retryButton')}
            </Button>
          </div>
        )}

        {data && data.found && data.lot && (
          <div
            className="cursor-pointer rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all"
            onClick={() => handleLotClick(data.lot!.id)}
          >
            <LotCard lot={data.lot} />
          </div>
        )}

        {data && !data.found && (
          <div className="text-sm space-y-2">
            <p className="text-muted-foreground">{t('lookup.notFound')}</p>
            {data.bidfaxUrl && (
              <a
                href={data.bidfaxUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary hover:underline"
              >
                {t('lookup.bidfaxLink')}
              </a>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
