'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/stores/auth.store';
import { useTranslations } from 'next-intl';

export default function AuthCallbackPage() {
  const t = useTranslations('Auth');
  const params = useSearchParams();
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      login(token);
      router.replace('/dashboard');
    } else {
      router.replace('/auth');
    }
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">{t('callbackLoading')}</p>
    </main>
  );
}
