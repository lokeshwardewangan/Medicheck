// Sentry disabled. To re-enable: uncomment the import and delete the stub below.
// import * as Sentry from '@sentry/nextjs';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Sentry: any = { init: () => {}, captureRequestError: undefined };

export async function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return; // Sentry is opt-in.

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV,
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
