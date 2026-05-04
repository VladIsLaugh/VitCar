export const LOCALES = ['uk', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'uk'

export const ROUTES = {
  home: '/',
  calculator: '/calculator',
  cars: '/cars',
  auth: '/auth',
  garage: '/garage',
  saved: '/saved',
  finance: '/finance'
} as const
