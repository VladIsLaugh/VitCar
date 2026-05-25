'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useRouter } from '@/i18n/routing';
import { apiClient } from '@/lib/api-client';
import { GoogleButton } from '@/components/auth/google-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AxiosError } from 'axios';

const schema = z.object({
  firstName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const t = useTranslations('Auth');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await apiClient.post('/auth/register', data);
      router.push('/auth/login?registered=1');
    } catch (err) {
      const status = (err as AxiosError)?.response?.status;
      const msg = status === 409 ? t('errorEmailTaken') : t('errorGeneric');
      setError('root', { message: msg });
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-primary px-4 py-12">
      <div className="w-full max-w-sm space-y-6 rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">{t('signUp')}</h1>
        </div>

        <GoogleButton />

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          {t('orContinueWith')}
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1">
            <Label htmlFor="firstName">{t('firstName')}</Label>
            <Input
              id="firstName"
              type="text"
              autoComplete="given-name"
              aria-invalid={!!errors.firstName}
              {...register('firstName')}
            />
            {errors.firstName && (
              <p className="text-xs text-destructive">{t('validationRequired')}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">{t('email')}</Label>
            <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{t('validationEmail')}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">{t('password')}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{t('validationPasswordMin')}</p>
            )}
          </div>

          {errors.root && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errors.root.message}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t('loading') : t('registerButton')}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {t('haveAccount')}{' '}
          <Link href="/auth/login" className="font-medium text-accent hover:underline">
            {t('goToLogin')}
          </Link>
        </p>
      </div>
    </main>
  );
}
