'use client';

import { useTranslations } from 'next-intl';

interface Props {
  makes: string[];
  makeModelMap: Record<string, string[]>;
  make: string;
  model: string;
  onMakeChange: (make: string) => void;
  onModelChange: (model: string) => void;
}

const selectClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981] disabled:opacity-50';

export default function MakeModelSelect({
  makes,
  makeModelMap,
  make,
  model,
  onMakeChange,
  onModelChange,
}: Props) {
  const t = useTranslations('Landing.miniCalculator');
  const models = make ? (makeModelMap[make] ?? []) : [];

  return (
    <>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">{t('makeLabel')}</label>
        <select
          value={make}
          onChange={(e) => {
            onMakeChange(e.target.value);
            onModelChange('');
          }}
          className={selectClass}
        >
          <option value="">—</option>
          {makes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">{t('modelLabel')}</label>
        <select
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          disabled={!make}
          className={selectClass}
        >
          <option value="">—</option>
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
