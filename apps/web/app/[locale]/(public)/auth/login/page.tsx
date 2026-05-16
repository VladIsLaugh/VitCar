'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api-client';
import { GoogleButton } from '@/components/auth/google-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AuthUser } from '@/contexts/auth-context';
import type { AxiosError } from 'axios';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const t = useTranslations('Auth');
  const router = useRouter();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await apiClient.post<{ accessToken: string; user: AuthUser }>(
        '/auth/login',
        data
      );
      login(res.data.accessToken, res.data.user);
      router.push('/dashboard');
    } catch (err) {
      const status = (err as AxiosError)?.response?.status;
      const msg = status === 403 ? t('errorEmailNotVerified') : t('errorInvalidCredentials');
      setError('root', { message: msg });
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-primary px-4 py-12">
      <div className="w-full max-w-sm space-y-6 rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">{t('signIn')}</h1>
        </div>

        <GoogleButton />

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          {t('orContinueWith')}
          <span className="h-px flex-1 bg-border" />
        </div>

        <form method="post" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1">
            <Label htmlFor="email">{t('email')}</Label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{t('validationEmail')}</p>}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t('password')}</Label>
              <Link href="/auth/forgot-password" className="text-xs text-accent hover:underline">
                {t('forgotPasswordLink')}
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{t('validationRequired')}</p>
            )}
          </div>

          {errors.root && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errors.root.message}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t('loading') : t('loginButton')}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {t('noAccount')}{' '}
          <Link href="/auth/register" className="font-medium text-accent hover:underline">
            {t('goToRegister')}
          </Link>
        </p>
      </div>
    </main>
  );
}
