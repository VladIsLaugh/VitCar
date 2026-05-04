import createMiddleware from 'next-intl/middleware'
import { LOCALES, DEFAULT_LOCALE } from '@/lib/constants'

export default createMiddleware({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE
})

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)']
}
