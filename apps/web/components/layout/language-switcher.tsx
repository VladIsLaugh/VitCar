'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import type { Locale } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchTo(newLocale: Locale) {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    router.push(pathname, { locale: newLocale });
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
