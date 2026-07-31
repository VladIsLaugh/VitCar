'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Share2, Save, FileDown, MessageCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCalculatorStore } from '@/stores/calculator.store';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from '@/i18n/routing';
import { apiClient } from '@/lib/api-client';

export default function ShareButtons() {
  const t = useTranslations('Calculator');
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuth();
  const { result, savedId, shareToken, isSaving, save } = useCalculatorStore();
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  if (!result) return null;

  const handleSave = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=/${locale}/calculator`);
      return;
    }
    try {
      await save();
      toast.success(t('result.savedSuccess'));
    } catch {
      toast.error(t('errors.saveFailed'));
    }
  };

  const handleShare = async () => {
    try {
      let token = shareToken;
      if (!token) {
        const saved = await save();
        token = saved.shareToken;
        toast.success(t('result.savedSuccess'));
      }
      const url = `${window.location.origin}/${locale}/calculator/share/${token}`;
      if (navigator.share) {
        await navigator.share({ title: 'VitAuto calculation', url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success(t('result.linkCopied'));
      }
    } catch {
      toast.error(t('errors.saveFailed'));
    }
  };

  const handlePdf = async () => {
    if (!savedId) return;
    setIsPdfLoading(true);
    try {
      const res = await apiClient.get(`/calculations/${savedId}/pdf`, {
        responseType: 'blob',
        params: { lang: locale },
      });
      const url = URL.createObjectURL(
        new Blob([res.data as BlobPart], { type: 'application/pdf' })
      );
      const a = document.createElement('a');
      a.href = url;
      a.download = `vitauto-${savedId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(t('errors.calculationFailed'));
    } finally {
      setIsPdfLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Button
        variant="outline"
        size="sm"
        onClick={handleSave}
        disabled={isSaving || !!savedId}
        className="gap-1.5"
      >
        <Save className="h-3.5 w-3.5" />
        {t('result.saveButton')}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        disabled={isSaving}
        className="gap-1.5"
      >
        <Share2 className="h-3.5 w-3.5" />
        {t('result.shareButton')}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handlePdf}
        disabled={!savedId || isPdfLoading}
        className="gap-1.5"
      >
        {isPdfLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <FileDown className="h-3.5 w-3.5" />
        )}
        {t('result.pdfButton')}
      </Button>

      <Button variant="outline" size="sm" asChild className="gap-1.5">
        <a href="https://t.me/vitauto_bot" target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-3.5 w-3.5" />
          {t('result.orderButton')}
        </a>
      </Button>
    </div>
  );
}
