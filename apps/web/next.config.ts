import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';

// On Vercel (all envs) the API URL must be explicitly configured.
// Failing here prevents a broken build from ever deploying silently.
if (process.env.VERCEL && !process.env.NEXT_PUBLIC_API_URL) {
  throw new Error(
    'NEXT_PUBLIC_API_URL is not set. Add it to Vercel → Project Settings → Environment Variables.'
  );
}

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {};

const nextIntlConfig = withNextIntl(nextConfig);

export default withSentryConfig(nextIntlConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // Source maps are uploaded to Sentry and hidden from the public bundle
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
