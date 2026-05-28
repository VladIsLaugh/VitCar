'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import type { LotDetailDto } from '@vitauto/shared-types';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface LotSpecTableProps {
  lot: LotDetailDto;
}

export function LotSpecTable({ lot }: LotSpecTableProps) {
  const t = useTranslations('catalog.spec');
  const locale = useLocale();
  const [vinCopied, setVinCopied] = useState(false);

  const copyVin = async () => {
    if (!lot.vin) return;
    await navigator.clipboard.writeText(lot.vin);
    setVinCopied(true);
    setTimeout(() => setVinCopied(false), 2000);
  };

  const price = lot.finalBid
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(lot.finalBid)
    : '—';

  const saleDate = lot.saleDate
    ? new Date(lot.saleDate).toLocaleDateString(locale === 'uk' ? 'uk-UA' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—';

  const rows: Array<{ label: string; value: React.ReactNode }> = [
    { label: t('make'), value: lot.make.name },
    { label: t('model'), value: lot.model.name },
    { label: t('year'), value: lot.year },
    { label: t('bodyType'), value: lot.bodyType ?? '—' },
    { label: t('fuelType'), value: lot.fuelType ?? '—' },
    { label: t('engineCC'), value: lot.engineCC ? `${lot.engineCC} cc` : '—' },
    {
      label: t('mileage'),
      value: lot.mileage
        ? `${lot.mileage.toLocaleString('en-US')} ${lot.mileageUnit.toLowerCase()}`
        : '—',
    },
    { label: t('damageType'), value: lot.damageType ?? '—' },
    { label: t('titleStatus'), value: lot.titleStatus ?? '—' },
    { label: t('source'), value: lot.source },
    { label: t('lotNumber'), value: lot.lotNumber },
    {
      label: t('vin'),
      value: lot.vin ? (
        <span className="flex items-center gap-2">
          <code className="font-mono text-sm">{lot.vin}</code>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => void copyVin()}
            title={vinCopied ? t('vinCopied') : t('copyVin')}
          >
            {vinCopied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </span>
      ) : (
        '—'
      ),
    },
    { label: t('saleDate'), value: saleDate },
    { label: t('state'), value: lot.state ?? '—' },
    { label: t('salePrice'), value: price },
  ];

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
              <td className="py-2.5 px-4 font-medium text-muted-foreground w-40">{row.label}</td>
              <td className="py-2.5 px-4">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
