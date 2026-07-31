'use client';

import { useTranslations } from 'next-intl';

interface Props {
  year: string;
  condition: string;
  onYearChange: (year: string) => void;
  onConditionChange: (condition: string) => void;
}

const selectClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981]';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 11 }, (_, i) => String(currentYear - i));

export default function YearConditionSelect({
  year,
  condition,
  onYearChange,
  onConditionChange,
}: Props) {
  const t = useTranslations('Landing.miniCalculator');

  return (
    <>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">{t('yearLabel')}</label>
        <select value={year} onChange={(e) => onYearChange(e.target.value)} className={selectClass}>
          <option value="">—</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">{t('conditionLabel')}</label>
        <select
          value={condition}
          onChange={(e) => onConditionChange(e.target.value)}
          className={selectClass}
        >
          <option value="">—</option>
          <option value="run-and-drive">{t('conditions.runAndDrive')}</option>
          <option value="engine-start">{t('conditions.engineStart')}</option>
          <option value="stationary">{t('conditions.stationary')}</option>
          <option value="enhanced-vehicle">{t('conditions.enhancedVehicle')}</option>
        </select>
      </div>
    </>
  );
}
