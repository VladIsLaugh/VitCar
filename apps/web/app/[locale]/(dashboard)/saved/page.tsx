import { useTranslations } from 'next-intl'

export default function SavedPage() {
  const t = useTranslations('Dashboard.Saved')

  return (
    <div>
      <h1>{t('title')}</h1>
    </div>
  )
}
