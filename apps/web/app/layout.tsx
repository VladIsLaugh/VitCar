import type { ReactNode } from 'react';

// Minimal root layout required by Next.js when using [locale] i18n routing.
// All html/body/font setup is in app/[locale]/layout.tsx.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
