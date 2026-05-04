import { useTranslations } from 'next-intl'

export default function CarsPage() {
  const t = useTranslations('Cars')

  return (
    <main>
      <h1>{t('title')}</h1>
    </main>
  )
}
