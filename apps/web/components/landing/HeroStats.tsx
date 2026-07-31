import { getTranslations } from 'next-intl/server';

interface StatItem {
  labelKey: 'statsCarsLabel' | 'statsAvgDaysLabel' | 'statsClientsLabel';
  value: string | null;
}

const STATS: StatItem[] = [
  { labelKey: 'statsCarsLabel', value: null },
  { labelKey: 'statsAvgDaysLabel', value: null },
  { labelKey: 'statsClientsLabel', value: null },
];

export default async function HeroStats() {
  const t = await getTranslations('Landing.hero');

  return (
    <div className="grid grid-cols-3 gap-3">
      {STATS.map(({ labelKey, value }) => (
        <div
          key={labelKey}
          className="flex flex-col gap-1 rounded-xl border border-border bg-card px-4 py-3"
        >
          <span className="text-2xl font-bold tabular-nums text-foreground">
            {value ?? '—'}
          </span>
          <span className="text-xs leading-snug text-muted-foreground">{t(labelKey)}</span>
        </div>
      ))}
    </div>
  );
}
