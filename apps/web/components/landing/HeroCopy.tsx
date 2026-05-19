import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export default async function HeroCopy() {
  const t = await getTranslations('Landing.hero');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="inline-flex items-center rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-1 text-xs font-semibold tracking-wide text-[#10B981]">
          {t('badge')}
        </span>
      </div>

      <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
        {t.rich('heading', {
          accent: (chunks) => <span className="text-[#10B981]">{chunks}</span>,
        })}
      </h1>

      <p className="text-lg text-muted-foreground md:text-xl">{t('subtitle')}</p>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/calculator"
          className="inline-flex items-center rounded-lg bg-[#0A2540] px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#0D2B4E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A2540] dark:bg-[#1B4F8A] dark:hover:bg-[#0D2B4E]"
        >
          {t('ctaPrimary')}
        </Link>
        <Link
          href="/cars"
          className="inline-flex items-center rounded-lg px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:text-[#10B981] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#10B981]"
        >
          {t('ctaSecondary')}
        </Link>
      </div>
    </div>
  );
}
