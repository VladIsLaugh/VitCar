import { useTranslations } from 'next-intl';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export default function HomePage() {
  const t = useTranslations('Home');

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-16 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">{t('title')}</h1>
          <ThemeToggle />
        </div>

        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-xl font-semibold">Design tokens</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded p-3 bg-primary text-primary-foreground">primary</div>
            <div className="rounded p-3 bg-accent text-accent-foreground">accent</div>
            <div className="rounded p-3 bg-muted text-muted-foreground">muted</div>
            <div className="rounded p-3 bg-secondary text-secondary-foreground">secondary</div>
            <div className="rounded p-3 bg-destructive text-destructive-foreground">
              destructive
            </div>
            <div className="rounded p-3 border bg-background text-foreground">background</div>
          </div>
        </div>

        <p className="text-muted-foreground text-sm">
          Toggle the button above to switch between light and dark theme. Refresh the page — your
          preference is saved.
        </p>
      </div>
    </main>
  );
}
