'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCalculatorStore } from '@/stores/calculator.store';
import { AuctionSource, AuctionCondition, UsPort } from '@vitauto/shared-types';

const US_PORTS: { value: UsPort; label: string }[] = [
  { value: UsPort.CHI, label: 'Chicago, IL' },
  { value: UsPort.HOU, label: 'Houston, TX' },
  { value: UsPort.LA, label: 'Los Angeles, CA' },
  { value: UsPort.MIA, label: 'Miami, FL' },
  { value: UsPort.NY, label: 'New York, NJ' },
  { value: UsPort.SAV, label: 'Savannah, GA' },
  { value: UsPort.SEATTLE, label: 'Seattle, WA' },
];

function convertMileage(value: number, from: 'miles' | 'km', to: 'miles' | 'km'): number {
  if (from === to) return value;
  return from === 'miles'
    ? Math.round(value * 1.60934)
    : Math.round(value / 1.60934);
}

function FieldLabel({
  label,
  tooltip,
  required,
  htmlFor,
}: {
  label: string;
  tooltip?: string;
  required?: boolean;
  htmlFor?: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <Label htmlFor={htmlFor}>{label}</Label>
      {required && <span className="text-destructive">*</span>}
      {tooltip && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-56 text-xs">{tooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export default function Step2AuctionInfo() {
  const t = useTranslations('Calculator');
  const { inputs, setInputs } = useCalculatorStore();

  const [mileage, setMileage] = useState<string>(
    inputs.mileage != null ? String(inputs.mileage) : ''
  );
  const [mileageUnit, setMileageUnit] = useState<'miles' | 'km'>(inputs.mileageUnit ?? 'miles');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const touchedRef = useRef<Set<string>>(new Set());

  function validate(field: string, value: unknown): string | undefined {
    if (field === 'auctionSource' && !value) return t('form.validation.required');
    if (field === 'usPort' && !value) return t('form.validation.required');
    if (field === 'auctionCondition' && !value) return t('form.validation.required');
    if (field === 'lotPrice') {
      const n = Number(value);
      if (!value || isNaN(n)) return t('form.validation.required');
      if (n < 100 || n > 200000) return t('form.validation.lotPriceRange');
    }
    return undefined;
  }

  function handleBlur(field: string, value: unknown) {
    touchedRef.current.add(field);
    const err = validate(field, value);
    setErrors((prev) => ({ ...prev, [field]: err ?? '' }));
  }

  const handleMileageUnitToggle = () => {
    const next = mileageUnit === 'miles' ? 'km' : 'miles';
    const current = parseFloat(mileage);
    if (!isNaN(current)) {
      const converted = convertMileage(current, mileageUnit, next);
      setMileage(String(converted));
      setInputs({ mileage: converted, mileageUnit: next });
    } else {
      setInputs({ mileageUnit: next });
    }
    setMileageUnit(next);
  };

  return (
    <div className="space-y-5">
      {/* Auction source */}
      <div className="space-y-2">
        <FieldLabel
          label={t('form.auctionSourceLabel')}
          tooltip={t('form.auctionSourceTooltip')}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          {[AuctionSource.COPART, AuctionSource.IAAI].map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => {
                setInputs({ auctionSource: src });
                handleBlur('auctionSource', src);
              }}
              className={`flex items-center justify-center gap-2 rounded-lg border p-4 text-sm font-semibold transition-colors ${
                inputs.auctionSource === src
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:bg-muted/40'
              }`}
            >
              {src === AuctionSource.COPART ? 'Copart' : 'IAAI'}
            </button>
          ))}
        </div>
        <FieldError message={errors.auctionSource} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* US port (shipping origin) */}
        <div className="space-y-1.5">
          <FieldLabel
            label={t('form.usPortLabel')}
            tooltip={t('form.usPortTooltip')}
            required
            htmlFor="usPort"
          />
          <Select
            value={inputs.usPort ?? ''}
            onValueChange={(v) => {
              setInputs({ usPort: v as UsPort });
              handleBlur('usPort', v);
            }}
          >
            <SelectTrigger id="usPort">
              <SelectValue placeholder={t('form.usPortPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="max-h-52">
                {US_PORTS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
          <FieldError message={errors.usPort} />
        </div>

        {/* Auction condition */}
        <div className="space-y-1.5">
          <FieldLabel
            label={t('form.auctionConditionLabel')}
            tooltip={t('form.auctionConditionTooltip')}
            required
            htmlFor="auctionCondition"
          />
          <Select
            value={inputs.auctionCondition ?? ''}
            onValueChange={(v) => {
              setInputs({ auctionCondition: v as AuctionCondition });
              handleBlur('auctionCondition', v);
            }}
          >
            <SelectTrigger id="auctionCondition">
              <SelectValue placeholder={t('form.auctionConditionPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={AuctionCondition.RUN_AND_DRIVE}>
                {t('form.conditions.runAndDrive')}
              </SelectItem>
              <SelectItem value={AuctionCondition.ENGINE_START}>
                {t('form.conditions.engineStart')}
              </SelectItem>
              <SelectItem value={AuctionCondition.STATIONARY}>
                {t('form.conditions.stationary')}
              </SelectItem>
              <SelectItem value={AuctionCondition.ENHANCED_VEHICLE}>
                {t('form.conditions.enhancedVehicle')}
              </SelectItem>
            </SelectContent>
          </Select>
          <FieldError message={errors.auctionCondition} />
        </div>

        {/* Lot price */}
        <div className="space-y-1.5">
          <FieldLabel
            label={t('form.lotPriceLabel')}
            tooltip={t('form.lotPriceTooltip')}
            required
            htmlFor="lotPrice"
          />
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">$</span>
            <Input
              id="lotPrice"
              type="number"
              min="100"
              max="200000"
              value={inputs.lotPrice?.toString() ?? ''}
              placeholder="8500"
              onChange={(e) => {
                const n = parseFloat(e.target.value);
                setInputs({ lotPrice: isNaN(n) ? undefined : n });
              }}
              onBlur={(e) => handleBlur('lotPrice', e.target.value)}
              className="pl-7"
            />
          </div>
          <p className="text-xs text-muted-foreground">{t('form.lotPriceHint')}</p>
          <FieldError message={errors.lotPrice} />
        </div>

        {/* Mileage (display only — not in calculation API) */}
        <div className="space-y-1.5">
          <FieldLabel
            label={t('form.mileageLabel')}
            tooltip={t('form.mileageTooltip')}
            htmlFor="mileage"
          />
          <div className="flex gap-2">
            <Input
              id="mileage"
              type="number"
              min="0"
              value={mileage}
              placeholder="45000"
              onChange={(e) => {
                setMileage(e.target.value);
                const n = parseFloat(e.target.value);
                setInputs({ mileage: isNaN(n) ? undefined : n, mileageUnit });
              }}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleMileageUnitToggle}
              className="w-16 shrink-0"
            >
              {mileageUnit}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
