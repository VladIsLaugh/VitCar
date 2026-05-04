import { useTranslations } from 'next-intl'

export default function GaragePage() {
  const t = useTranslations('Dashboard.Garage')

  return (
    <div>
      <h1>{t('title')}</h1>
    </div>
  )
}
