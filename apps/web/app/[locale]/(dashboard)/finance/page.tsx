import { useTranslations } from 'next-intl'

export default function FinancePage() {
  const t = useTranslations('Dashboard.Finance')

  return (
    <div>
      <h1>{t('title')}</h1>
    </div>
  )
}
