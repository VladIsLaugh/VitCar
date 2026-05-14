import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';

// NEXT_PUBLIC_API_URL must be set in Vercel for all environments.
// Hard-fail on production so a broken build can never go live.
// Warn on preview/dev so Vercel preview builds still succeed while making
// the missing variable visible in the build log.
if (process.env.VERCEL && !process.env.NEXT_PUBLIC_API_URL) {
  const msg =
    'NEXT_PUBLIC_API_URL is not set. Add it to Vercel → Project Settings → Environment Variables.';
  if (process.env.VERCEL_ENV === 'production') {
    throw new Error(msg);
  } else {
    console.warn(`[VitCar] WARNING: ${msg}`);
  }
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
