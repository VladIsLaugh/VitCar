'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(newLocale: string) {
    const withoutLocale = pathname.replace(/^\/(uk|en)/, '');
    router.push(`/${newLocale}${withoutLocale || '/'}`);
  }

  return (
    <div
      className="flex items-center text-sm font-medium"
      role="group"
      aria-label="Language switcher"
    >
      <button
        onClick={() => switchTo('uk')}
        className={cn(
          'px-2 py-1 rounded-sm transition-colors',
          locale === 'uk'
            ? 'text-foreground font-semibold'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-pressed={locale === 'uk'}
      >
        UA
      </button>
      <span className="text-border select-none" aria-hidden="true">
        |
      </span>
      <button
        onClick={() => switchTo('en')}
        className={cn(
          'px-2 py-1 rounded-sm transition-colors',
          locale === 'en'
            ? 'text-foreground font-semibold'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-pressed={locale === 'en'}
      >
        EN
      </button>
    </div>
  );
}
