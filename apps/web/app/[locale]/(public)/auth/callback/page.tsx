'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/auth-context';
import { apiClient, setApiToken } from '@/lib/api-client';
import type { AuthUser } from '@/contexts/auth-context';

export default function AuthCallbackPage() {
  const t = useTranslations('Auth');
  const params = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      router.replace('/auth/login');
      return;
    }
    // Prime the interceptor with the token so /auth/me gets the Authorization header
    setApiToken(token);
    apiClient
      .get<AuthUser>('/auth/me')
      .then((res) => {
        login(token, res.data);
        router.replace('/dashboard');
      })
      .catch(() => router.replace('/auth/login'));
  }, [login, params, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-primary">
      <p className="text-white/70">{t('callbackLoading')}</p>
    </main>
  );
}
