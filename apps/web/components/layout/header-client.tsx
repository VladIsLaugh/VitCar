'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { LanguageSwitcher } from './language-switcher';
import { MobileNav } from './mobile-nav';
import { VitAutoLogo } from './logo';
import { cn } from '@/lib/utils';

export function HeaderClient() {
  const t = useTranslations('Nav');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const translatedItems = [
    { href: '/#how', id: 'how', label: t('howItWorks') },
    { href: '/#cases', id: 'cases', label: t('cases') },
    { href: '/calculator', id: 'calculator', label: t('calculator') },
    { href: '/#faq', id: 'faq', label: t('faq') },
    { href: '/#contacts', id: 'contacts', label: t('contacts') },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-transparent',
        'bg-background/[.92] backdrop-blur-[14px] backdrop-saturate-[180%]',
        'transition-[border-color,box-shadow] duration-[140ms]',
        scrolled && [
          'border-border',
          'shadow-[0_4px_18px_-8px_rgba(10,37,64,0.10)]',
          'dark:shadow-[0_4px_18px_-6px_rgba(0,0,0,0.5)]',
        ]
      )}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* ── Desktop header ────────────────────────────── */}
        <div className="hidden md:flex h-[72px] items-center justify-between gap-7">
          <VitAutoLogo />

          <nav className="flex items-center gap-1 flex-1 ml-6" aria-label="Main navigation">
            {translatedItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'relative px-3.5 py-2.5 text-sm font-medium rounded-md transition-colors',
                  'text-muted-foreground hover:text-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button variant="outline" size="sm" asChild>
              <Link href="/auth/login">{t('signIn')}</Link>
            </Button>
            <Button size="sm" className="gap-1.5" asChild>
              <Link href="/calculator">
                {t('calculate')}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* ── Mobile header ─────────────────────────────── */}
        <div className="flex md:hidden h-14 items-center justify-between">
          <VitAutoLogo />
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
            <MobileNav items={translatedItems} />
          </div>
        </div>
      </div>
    </header>
  );
}
