import { redirect } from '@/i18n/routing';
import { getLocale } from 'next-intl/server';

export default async function AuthPage() {
  const locale = await getLocale();
  redirect({ href: '/auth/login', locale });
}
