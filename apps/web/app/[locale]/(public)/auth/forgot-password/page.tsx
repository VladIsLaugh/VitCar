'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from '@/i18n/routing';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AxiosError } from 'axios';

const schema = z.object({ email: z.string().email() });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const t = useTranslations('Auth');
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await apiClient.post('/auth/forgot-password', data);
      setSent(true);
    } catch (err) {
      // API responded with any HTTP status → still show success (prevents email enumeration)
      // API was unreachable (no response object) → show error
      if ((err as AxiosError)?.response !== undefined) {
        setSent(true);
      } else {
        setError('root', { message: t('errorGeneric') });
      }
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-primary px-4 py-12">
      <div className="w-full max-w-sm space-y-6 rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">{t('forgotPasswordTitle')}</h1>
        </div>

        {sent ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">{t('forgotPasswordSuccess')}</p>
            <Link href="/auth/login" className="text-sm font-medium text-accent hover:underline">
              {t('goToLogin')}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1">
              <Label htmlFor="email">{t('email')}</Label>
              <Input id="email" type="email" autoComplete="email" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{t('validationEmail')}</p>}
            </div>

            {errors.root && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errors.root.message}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t('loading') : t('forgotPasswordButton')}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              <Link href="/auth/login" className="font-medium text-accent hover:underline">
                {t('goToLogin')}
              </Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
