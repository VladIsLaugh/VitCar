import { useTranslations } from 'next-intl'

export default function CalculatorPage() {
  const t = useTranslations('Calculator')

  return (
    <main>
      <h1>{t('title')}</h1>
    </main>
  )
}
