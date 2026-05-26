'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { loadDraft, clearDraft } from '@/lib/calculator-draft';
import { apiClient } from '@/lib/api-client';

export default function DraftMigrationListener() {
  const t = useTranslations('Calculator');

  useEffect(() => {
    function handleLogin() {
      const draft = loadDraft();
      if (!draft) return;

      const { inputs, result } = draft;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { make, model, bodyType, vin, mileage, mileageUnit, ...apiInputs } = inputs;

      apiClient
        .post('/calculations/save', { inputParams: apiInputs, result })
        .then(() => {
          clearDraft();
          toast.success(t('draftMigrated'));
        })
        .catch(() => {
          toast.error(t('draftMigrationFailed'));
        });
    }

    window.addEventListener('vitauto:login', handleLogin);
    return () => window.removeEventListener('vitauto:login', handleLogin);
  }, [t]);

  return null;
}
