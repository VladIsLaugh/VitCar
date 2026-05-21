import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { VitAutoLogo } from './logo';

function TelegramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9.78 17.84l.36-3.84 7-6.32c.32-.28-.06-.42-.48-.16L8 13l-3.76-1.2c-.8-.24-.82-.8.18-1.2L19.4 5.04c.68-.32 1.32.16 1.06 1.2L18.04 17.8c-.18.8-.66 1-1.36.62L13 15.4l-1.84 1.78c-.2.2-.38.36-.78.36l.4-3.5" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

export async function Footer() {
  const t = await getTranslations('Footer');

  return (
    <footer className="bg-[#0A2540] text-white/[.78]">
      {/* ── Main grid ─────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 gap-8 pt-14 pb-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.2fr] lg:gap-14">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1 max-w-sm">
            <div className="mb-4">
              <VitAutoLogo white />
            </div>
            <p className="text-sm leading-relaxed text-white/60 mb-5">{t('desc')}</p>
            <div className="flex gap-2.5">
              <a
                href="#"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/[.08] text-white/85 hover:bg-accent hover:text-white transition-colors"
                aria-label="Telegram"
              >
                <TelegramIcon />
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/[.08] text-white/85 hover:bg-accent hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-[11px] uppercase tracking-[0.08em] text-white/45 font-mono font-medium mb-1.5">
              {t('product')}
            </h4>
            <Link
              href="/calculator"
              className="text-sm text-white/[.78] hover:text-white transition-colors"
            >
              {t('calculator')}
            </Link>
            <Link
              href="/#how"
              className="text-sm text-white/[.78] hover:text-white transition-colors"
            >
              {t('howItWorks')}
            </Link>
            <Link
              href="/#cases"
              className="text-sm text-white/[.78] hover:text-white transition-colors"
            >
              {t('cases')}
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-white/[.78] hover:text-white transition-colors"
            >
              {t('dashboard')}
            </Link>
            <Link href="#" className="text-sm text-white/[.78] hover:text-white transition-colors">
              {t('tracker')}
            </Link>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-[11px] uppercase tracking-[0.08em] text-white/45 font-mono font-medium mb-1.5">
              {t('company')}
            </h4>
            <Link href="#" className="text-sm text-white/[.78] hover:text-white transition-colors">
              {t('about')}
            </Link>
            <Link href="#" className="text-sm text-white/[.78] hover:text-white transition-colors">
              {t('team')}
            </Link>
            <Link href="#" className="text-sm text-white/[.78] hover:text-white transition-colors">
              {t('partners')}
            </Link>
            <Link href="#" className="text-sm text-white/[.78] hover:text-white transition-colors">
              {t('careers')}
            </Link>
            <Link href="#" className="text-sm text-white/[.78] hover:text-white transition-colors">
              {t('agreement')}
            </Link>
          </div>

          {/* Contacts */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-[11px] uppercase tracking-[0.08em] text-white/45 font-mono font-medium mb-1.5">
              {t('contacts')}
            </h4>
            <span className="inline-flex items-center gap-1.5 text-sm text-white/[.78]">
              <Phone className="h-3.5 w-3.5 text-white/50" />
              {t('phone')}
            </span>
            <a
              href="mailto:hi@vitauto.ua"
              className="inline-flex items-center gap-1.5 text-sm text-white/[.78] hover:text-white transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-white/50" />
              hi@vitauto.ua
            </a>
            <span className="inline-flex items-center gap-1.5 text-sm text-white/[.78]">
              <MapPin className="h-3.5 w-3.5 text-white/50" />
              {t('cities')}
            </span>
            <a
              href="https://t.me/vitauto_bot"
              className="inline-flex items-center gap-1.5 text-sm text-[#10B981] hover:text-[#34D399] transition-colors"
            >
              <TelegramIcon />
              @vitauto_bot
            </a>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────── */}
      <div className="border-t border-white/[.08]">
        <div className="max-w-[1200px] mx-auto px-6 py-[18px] flex flex-wrap items-center justify-between gap-3 text-xs text-white/45 font-mono tracking-[0.02em]">
          <span>
            © {new Date().getFullYear()} VitAuto. {t('allRightsReserved')}
          </span>
          <span className="opacity-80">{t('legal')}</span>
          <span>
            <Link href="#" className="text-white/60 hover:text-white transition-colors mx-0.5">
              {t('privacy')}
            </Link>
            {' · '}
            <Link href="#" className="text-white/60 hover:text-white transition-colors mx-0.5">
              {t('terms')}
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
