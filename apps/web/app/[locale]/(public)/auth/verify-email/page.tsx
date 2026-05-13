'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/routing';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/contexts/auth-context';

export default function VerifyEmailPage() {
  const t = useTranslations('Auth');
  const params = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setStatus('error');
      return;
    }

    apiClient
      .post<{ accessToken: string; user: AuthUser }>('/auth/verify-email', { token })
      .then((res) => {
        login(res.data.accessToken, res.data.user);
        setStatus('success');
        setTimeout(() => router.replace('/dashboard'), 1500);
      })
      .catch(() => setStatus('error'));
  }, [login, params, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-primary px-4">
      <div className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-zinc-900">
        {status === 'loading' && <p className="text-muted-foreground">{t('verifyEmailLoading')}</p>}
        {status === 'success' && (
          <p className="font-semibold text-accent">{t('verifyEmailSuccess')}</p>
        )}
        {status === 'error' && (
          <>
            <p className="text-destructive">{t('verifyEmailError')}</p>
            <Link href="/auth/login" className="text-sm font-medium text-accent hover:underline">
              {t('goToLogin')}
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
