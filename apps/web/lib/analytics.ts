export type AnalyticsEvent =
  | 'calculator_started'
  | 'calculator_completed'
  | 'lot_viewed'
  | 'lot_saved'
  | 'signup_started'
  | 'signup_completed'
  | 'cta_clicked';

declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
  }
}

export function trackEvent(name: AnalyticsEvent, params?: Record<string, string | number>): void {
  if (typeof window === 'undefined') return;
  if (!window.gtag) return;
  window.gtag('event', name, params);
}
