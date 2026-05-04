import { useTranslations } from 'next-intl'

export default function AuthPage() {
  const t = useTranslations('Auth')

  return (
    <main>
      <h1>{t('signIn')}</h1>
    </main>
  )
}
