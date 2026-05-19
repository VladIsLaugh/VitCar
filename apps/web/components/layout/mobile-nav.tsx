'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, ArrowRight, Phone, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from './theme-toggle';
import { LanguageSwitcher } from './language-switcher';
import { VitAutoLogo } from './logo';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  id: string;
}

interface MobileNavProps {
  items: NavItem[];
  activeId?: string;
}

export function MobileNav({ items, activeId }: MobileNavProps) {
  const t = useTranslations('Nav');
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('openMenu')}>
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[320px] max-w-[88vw] p-0 flex flex-col">
        {/* Head — pr-12 leaves space for the built-in SheetClose X button */}
        <div className="flex items-center border-b px-4 py-4 pr-12">
          <VitAutoLogo />
        </div>

        {/* Nav */}
        <nav
          className="flex-1 flex flex-col gap-0.5 p-2 overflow-y-auto"
          aria-label="Mobile navigation"
        >
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center justify-between px-4 py-3.5 rounded-md text-[15px] font-medium transition-colors',
                activeId === item.id ? 'bg-accent/10 text-accent' : 'text-foreground hover:bg-muted'
              )}
            >
              <span>{item.label}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </nav>

        {/* Settings */}
        <div className="border-t px-4 py-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-mono tracking-wide">
              {t('language')}
            </span>
            <LanguageSwitcher />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-mono tracking-wide">
              {t('theme')}
            </span>
            <ThemeToggle />
          </div>
        </div>

        {/* CTA */}
        <div className="border-t px-4 py-3 flex flex-col gap-2">
          <Button variant="outline" size="lg" className="w-full" asChild>
            <Link href="/auth/login" onClick={() => setOpen(false)}>
              {t('signIn')}
            </Link>
          </Button>
          <Button size="lg" className="w-full gap-2" asChild>
            <Link href="/calculator" onClick={() => setOpen(false)}>
              {t('calculate')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Foot */}
        <div className="border-t px-4 py-3 pb-5 flex flex-col gap-2">
          <a
            href="tel:+380670000000"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            +380 67 000 0000
          </a>
          <a
            href="mailto:hi@vitauto.ua"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            <Mail className="h-3.5 w-3.5" />
            hi@vitauto.ua
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
