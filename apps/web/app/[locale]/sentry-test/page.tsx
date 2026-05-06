'use client';

import * as Sentry from '@sentry/nextjs';
import { useState } from 'react';

export default function SentryTestPage() {
  const [sent, setSent] = useState(false);

  function triggerError() {
    throw new Error('Test Sentry — intentional client error from /sentry-test');
  }

  function captureMessage() {
    Sentry.captureMessage('Test Sentry message from /sentry-test', 'info');
    setSent(true);
  }

  return (
    <div style={{ padding: 32, fontFamily: 'monospace' }}>
      <h1>Sentry Test Page</h1>
      <p>Only works in production (Sentry is disabled in development).</p>
      <br />
      <button onClick={triggerError} style={{ marginRight: 16 }}>
        Throw client error (captured by error boundary)
      </button>
      <button onClick={captureMessage}>{sent ? 'Message sent!' : 'Capture message'}</button>
    </div>
  );
}
