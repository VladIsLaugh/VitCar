import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { LOCALES } from '@/lib/constants'

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale

  if (!locale || !LOCALES.includes(locale as (typeof LOCALES)[number])) {
    notFound()
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  }
})
