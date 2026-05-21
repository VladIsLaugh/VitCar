import { getTranslations } from 'next-intl/server';

type StepKey =
  | 'demoTrackerStep1'
  | 'demoTrackerStep2'
  | 'demoTrackerStep3'
  | 'demoTrackerStep4';

interface Step {
  key: StepKey;
  completed: boolean;
  active?: boolean;
}

const STEPS: Step[] = [
  { key: 'demoTrackerStep1', completed: true },
  { key: 'demoTrackerStep2', completed: true },
  { key: 'demoTrackerStep3', completed: false, active: true },
  { key: 'demoTrackerStep4', completed: false },
];

export default async function DemoTracker() {
  const t = await getTranslations('Landing.hero');

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{t('demoTrackerCar')}</p>
          <p className="text-xs text-muted-foreground">{t('demoTrackerLot')}</p>
        </div>
        <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {t('demoTrackerLabel')}
        </span>
      </div>

      <div className="space-y-2.5">
        {STEPS.map(({ key, completed, active }, i) => (
          <div key={key} className="flex items-center gap-3">
            <div
              className={[
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                completed
                  ? 'bg-[#10B981] text-white'
                  : active
                    ? 'border-2 border-[#10B981] text-[#10B981]'
                    : 'border-2 border-border text-muted-foreground',
              ].join(' ')}
            >
              {completed ? '✓' : i + 1}
            </div>
            <span
              className={`text-sm ${completed || active ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              {t(key)}
            </span>
            {active && (
              <span className="ml-auto h-2 w-2 rounded-full bg-[#10B981]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
