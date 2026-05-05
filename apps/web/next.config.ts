import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';

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
