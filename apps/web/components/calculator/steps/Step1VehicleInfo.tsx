'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronsUpDown, Check, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCalculatorStore } from '@/stores/calculator.store';
import { FuelType, CarSize } from '@vitauto/shared-types';
import type { VinDecodeResultDto } from '@vitauto/shared-types';
import { apiClient } from '@/lib/api-client';

const TOP_MAKES = [
  'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler',
  'Dodge', 'Ford', 'Genesis', 'GMC', 'Honda', 'Hyundai', 'Infiniti',
  'Jaguar', 'Jeep', 'Kia', 'Land Rover', 'Lexus', 'Lincoln', 'Mazda',
  'Mercedes-Benz', 'Mitsubishi', 'Nissan', 'RAM', 'Subaru', 'Tesla',
  'Toyota', 'Volkswagen', 'Volvo',
];

const MAKE_MODELS: Record<string, string[]> = {
  Toyota: ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius', 'Tacoma', 'Tundra', '4Runner', 'Sienna', 'Venza'],
  Honda: ['Accord', 'Civic', 'CR-V', 'Pilot', 'Odyssey', 'HR-V', 'Passport', 'Ridgeline'],
  Ford: ['F-150', 'Explorer', 'Escape', 'Mustang', 'Edge', 'Expedition', 'Ranger', 'Bronco'],
  Chevrolet: ['Silverado', 'Equinox', 'Tahoe', 'Suburban', 'Malibu', 'Traverse', 'Colorado', 'Blazer'],
  BMW: ['3 Series', '5 Series', '7 Series', 'X3', 'X5', 'X7', 'X1', 'M3', 'M5'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLE', 'GLC', 'GLS', 'A-Class', 'G-Class'],
  Audi: ['A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron'],
  Nissan: ['Altima', 'Sentra', 'Rogue', 'Pathfinder', 'Murano', 'Frontier', 'Titan', 'Leaf'],
  Hyundai: ['Sonata', 'Elantra', 'Tucson', 'Santa Fe', 'Palisade', 'Kona', 'Ioniq 5', 'Ioniq 6'],
  Kia: ['Optima', 'Sorento', 'Sportage', 'Telluride', 'Stinger', 'EV6', 'Soul', 'Seltos'],
  Lexus: ['ES', 'IS', 'GS', 'LS', 'RX', 'NX', 'GX', 'LX'],
  Tesla: ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck'],
  Jeep: ['Grand Cherokee', 'Cherokee', 'Wrangler', 'Gladiator', 'Compass', 'Renegade'],
  RAM: ['1500', '2500', '3500', 'ProMaster'],
  GMC: ['Sierra', 'Terrain', 'Acadia', 'Yukon', 'Canyon'],
  Subaru: ['Outback', 'Forester', 'Crosstrek', 'Impreza', 'Legacy', 'Ascent'],
  Mazda: ['Mazda3', 'Mazda6', 'CX-5', 'CX-9', 'CX-30', 'MX-5 Miata'],
  Volkswagen: ['Jetta', 'Passat', 'Tiguan', 'Atlas', 'Golf', 'ID.4'],
  Volvo: ['XC40', 'XC60', 'XC90', 'S60', 'S90', 'V60', 'V90'],
  Dodge: ['Charger', 'Challenger', 'Durango', 'RAM 1500'],
  Cadillac: ['Escalade', 'CT5', 'CT4', 'XT5', 'XT6', 'XT4'],
  Infiniti: ['Q50', 'Q60', 'QX50', 'QX60', 'QX80'],
  Acura: ['TLX', 'MDX', 'RDX', 'ILX'],
  Lincoln: ['Navigator', 'Aviator', 'Corsair', 'Nautilus'],
  Chrysler: ['300', 'Pacifica', 'Voyager'],
  Buick: ['Enclave', 'Encore', 'Envision', 'LaCrosse'],
  Genesis: ['G70', 'G80', 'G90', 'GV70', 'GV80'],
  Jaguar: ['F-Pace', 'E-Pace', 'I-Pace', 'XE', 'XF'],
  'Land Rover': ['Discovery', 'Defender', 'Range Rover', 'Range Rover Sport', 'Range Rover Evoque'],
  Mitsubishi: ['Outlander', 'Eclipse Cross', 'Galant', 'Montero'],
};

const BODY_TYPES = ['Sedan', 'SUV', 'Pickup', 'Hatchback', 'Coupe', 'Minivan', 'Wagon'] as const;

const BODY_TYPE_I18N_KEYS = {
  Sedan: 'form.bodyTypes.sedan',
  SUV: 'form.bodyTypes.suv',
  Pickup: 'form.bodyTypes.pickup',
  Hatchback: 'form.bodyTypes.hatchback',
  Coupe: 'form.bodyTypes.coupe',
  Minivan: 'form.bodyTypes.minivan',
  Wagon: 'form.bodyTypes.wagon',
} as const satisfies Record<typeof BODY_TYPES[number], string>;
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1999 }, (_, i) => CURRENT_YEAR - i);

interface ComboboxProps {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled?: boolean;
}

function Combobox({ options, value, onChange, placeholder, disabled }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open && !disabled} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <div className="border-b p-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="h-8 border-0 p-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <ScrollArea className="max-h-52">
          {filtered.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No results</p>
          ) : (
            <div className="p-1">
              {filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                  onClick={() => {
                    onChange(opt);
                    setSearch('');
                    setOpen(false);
                  }}
                >
                  <Check
                    className={`h-4 w-4 shrink-0 ${value === opt ? 'opacity-100' : 'opacity-0'}`}
                  />
                  {opt}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
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

export default function Step1VehicleInfo() {
  const t = useTranslations('Calculator');
  const { inputs, setInputs } = useCalculatorStore();

  // Local-only form state (not needed by the calculation API)
  const [bodyType, setBodyType] = useState(inputs.bodyType ?? '');
  const [vin, setVin] = useState(inputs.vin ?? '');
  const [vinLoading, setVinLoading] = useState(false);
  const [vinError, setVinError] = useState<string | null>(null);

  // Derived display value: store holds cc, form shows liters
  const engineVolumeLiters =
    inputs.engineVolume != null ? (inputs.engineVolume / 1000).toString() : '';

  // Errors shown on blur
  const [errors, setErrors] = useState<Record<string, string>>({});
  const touchedRef = useRef<Set<string>>(new Set());

  function validate(field: string, value: unknown): string | undefined {
    if (field === 'make' && !value) return t('form.validation.required');
    if (field === 'model' && !value) return t('form.validation.required');
    if (field === 'year' && !value) return t('form.validation.required');
    if (field === 'fuelType' && !value) return t('form.validation.required');
    if (field === 'carSize' && !value) return t('form.validation.required');
    if (field === 'engineVolume') {
      const liters = Number(value);
      if (inputs.fuelType !== FuelType.ELECTRIC && !isNaN(liters)) {
        if (liters < 0.5 || liters > 8) return t('form.validation.engineVolumeRange');
      }
    }
    if (field === 'batteryCapacity') {
      const kwh = Number(value);
      if (inputs.fuelType === FuelType.ELECTRIC && isNaN(kwh)) {
        return t('form.validation.required');
      }
    }
    return undefined;
  }

  function handleBlur(field: string, value: unknown) {
    touchedRef.current.add(field);
    const err = validate(field, value);
    setErrors((prev) => ({ ...prev, [field]: err ?? '' }));
  }

  const handleMakeChange = (make: string) => {
    setInputs({ make, model: undefined });
    handleBlur('make', make);
  };

  const handleModelChange = (model: string) => {
    setInputs({ model });
    handleBlur('model', model);
  };

  const handleVinBlur = async () => {
    setInputs({ vin });
    if (vin.length !== 17) return;
    setVinLoading(true);
    setVinError(null);
    try {
      const { data } = await apiClient.get<VinDecodeResultDto>(`/vehicles/vin/${vin}`);
      setInputs({
        make: data.make ?? undefined,
        model: data.model ?? undefined,
        year: data.year ?? undefined,
        fuelType: data.fuelType ?? undefined,
        batteryCapacity: data.batteryKwh ?? undefined,
      });
    } catch {
      setVinError(t('form.vinError'));
    } finally {
      setVinLoading(false);
    }
  };

  const isElectric = inputs.fuelType === FuelType.ELECTRIC;
  const models = inputs.make ? (MAKE_MODELS[inputs.make] ?? []) : [];

  return (
    <div className="space-y-5">
      {/* VIN (optional, at top for auto-fill UX) */}
      <div className="space-y-1.5">
        <FieldLabel
          label={t('form.vinLabel')}
          tooltip={t('form.vinTooltip')}
          htmlFor="vin"
        />
        <div className="relative">
          <Input
            id="vin"
            value={vin}
            maxLength={17}
            placeholder={t('form.vinPlaceholder')}
            onChange={(e) => setVin(e.target.value.toUpperCase())}
            onBlur={handleVinBlur}
            className="pr-8 uppercase"
          />
          {vinLoading && (
            <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        {vinError && <p className="text-xs text-destructive">{vinError}</p>}
        <p className="text-xs text-muted-foreground">{t('form.vinHint')}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Make */}
        <div className="space-y-1.5">
          <FieldLabel
            label={t('form.makeLabel')}
            tooltip={t('form.makeTooltip')}
            required
            htmlFor="make"
          />
          <Combobox
            options={TOP_MAKES}
            value={inputs.make ?? ''}
            onChange={handleMakeChange}
            placeholder={t('form.makePlaceholder')}
          />
          <FieldError message={errors.make} />
        </div>

        {/* Model */}
        <div className="space-y-1.5">
          <FieldLabel
            label={t('form.modelLabel')}
            tooltip={t('form.modelTooltip')}
            required
            htmlFor="model"
          />
          {models.length > 0 ? (
            <Select
              value={inputs.model ?? ''}
              onValueChange={(v) => handleModelChange(v)}
              disabled={!inputs.make}
            >
              <SelectTrigger id="model">
                <SelectValue placeholder={t('form.modelPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {models.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="model"
              value={inputs.model ?? ''}
              placeholder={t('form.modelPlaceholder')}
              disabled={!inputs.make}
              onChange={(e) => setInputs({ model: e.target.value })}
              onBlur={(e) => handleBlur('model', e.target.value)}
            />
          )}
          <FieldError message={errors.model} />
        </div>

        {/* Year */}
        <div className="space-y-1.5">
          <FieldLabel
            label={t('form.yearLabel')}
            tooltip={t('form.yearTooltip')}
            required
            htmlFor="year"
          />
          <Select
            value={inputs.year?.toString() ?? ''}
            onValueChange={(v) => {
              setInputs({ year: Number(v) });
              handleBlur('year', v);
            }}
          >
            <SelectTrigger id="year">
              <SelectValue placeholder={t('form.yearPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-52">
                {YEARS.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
          <FieldError message={errors.year} />
        </div>

        {/* Body type (display only, not in API) */}
        <div className="space-y-1.5">
          <FieldLabel label={t('form.bodyTypeLabel')} tooltip={t('form.bodyTypeTooltip')} htmlFor="bodyType" />
          <Select
            value={bodyType}
            onValueChange={(v) => {
              setBodyType(v);
              setInputs({ bodyType: v });
            }}
          >
            <SelectTrigger id="bodyType">
              <SelectValue placeholder={t('form.bodyTypePlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {BODY_TYPES.map((b) => (
                <SelectItem key={b} value={b}>
                  {t(BODY_TYPE_I18N_KEYS[b])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fuel type */}
        <div className="space-y-1.5">
          <FieldLabel
            label={t('form.fuelTypeLabel')}
            tooltip={t('form.fuelTypeTooltip')}
            required
            htmlFor="fuelType"
          />
          <Select
            value={inputs.fuelType ?? ''}
            onValueChange={(v) => {
              setInputs({
                fuelType: v as FuelType,
                // Clear engine/battery when switching fuel type
                engineVolume: undefined,
                batteryCapacity: undefined,
              });
              handleBlur('fuelType', v);
            }}
          >
            <SelectTrigger id="fuelType">
              <SelectValue placeholder={t('form.fuelTypePlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FuelType.PETROL}>{t('form.fuelTypes.petrol')}</SelectItem>
              <SelectItem value={FuelType.DIESEL}>{t('form.fuelTypes.diesel')}</SelectItem>
              <SelectItem value={FuelType.HYBRID}>{t('form.fuelTypes.hybrid')}</SelectItem>
              <SelectItem value={FuelType.ELECTRIC}>{t('form.fuelTypes.electric')}</SelectItem>
            </SelectContent>
          </Select>
          <FieldError message={errors.fuelType} />
        </div>

        {/* Engine volume — hidden for electric */}
        {!isElectric && (
          <div className="space-y-1.5">
            <FieldLabel
              label={t('form.engineVolumeLabel')}
              tooltip={t('form.engineVolumeTooltip')}
              required
              htmlFor="engineVolume"
            />
            <div className="relative">
              <Input
                id="engineVolume"
                type="number"
                step="0.1"
                min="0.5"
                max="8"
                value={engineVolumeLiters}
                placeholder="1.5"
                onChange={(e) => {
                  const liters = parseFloat(e.target.value);
                  if (!isNaN(liters)) {
                    setInputs({ engineVolume: Math.round(liters * 1000) });
                  } else {
                    setInputs({ engineVolume: undefined });
                  }
                }}
                onBlur={(e) => handleBlur('engineVolume', e.target.value)}
                className="pr-10"
              />
              <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">L</span>
            </div>
            <FieldError message={errors.engineVolume} />
          </div>
        )}

        {/* Battery capacity — visible for electric */}
        {isElectric && (
          <div className="space-y-1.5">
            <FieldLabel
              label={t('form.batteryCapacityLabel')}
              tooltip={t('form.batteryCapacityTooltip')}
              required
              htmlFor="batteryCapacity"
            />
            <div className="relative">
              <Input
                id="batteryCapacity"
                type="number"
                min="1"
                step="0.1"
                value={inputs.batteryCapacity?.toString() ?? ''}
                placeholder="75"
                onChange={(e) => {
                  const kwh = parseFloat(e.target.value);
                  setInputs({ batteryCapacity: isNaN(kwh) ? undefined : kwh });
                }}
                onBlur={(e) => handleBlur('batteryCapacity', e.target.value)}
                className="pr-12"
              />
              <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">kWh</span>
            </div>
            <FieldError message={errors.batteryCapacity} />
          </div>
        )}
      </div>

      {/* Car size */}
      <div className="space-y-2">
        <FieldLabel
          label={t('form.carSizeLabel')}
          tooltip={t('form.carSizeTooltip')}
          required
        />
        <RadioGroup
          value={inputs.carSize ?? ''}
          onValueChange={(v) => {
            setInputs({ carSize: v as CarSize });
            handleBlur('carSize', v);
          }}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {[CarSize.SMALL, CarSize.BIG].map((size) => (
            <label
              key={size}
              htmlFor={`carSize-${size}`}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                inputs.carSize === size
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted/40'
              }`}
            >
              <RadioGroupItem value={size} id={`carSize-${size}`} className="mt-0.5" />
              <div>
                <p className="text-sm font-medium">
                  {size === CarSize.SMALL ? t('form.carSizeSmall') : t('form.carSizeBig')}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {size === CarSize.SMALL ? t('form.carSizeSmallDesc') : t('form.carSizeBigDesc')}
                </p>
              </div>
            </label>
          ))}
        </RadioGroup>
        <FieldError message={errors.carSize} />
      </div>
    </div>
  );
}
