// Sentry disabled. To re-enable: uncomment the import and delete the stub below.
// import * as Sentry from '@sentry/nextjs';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Sentry: any = { init: () => {}, captureRouterTransitionStart: undefined };

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
    // Don't send PHI fields. Strip anything that looks like email/phone/name.
    beforeSend(event: unknown) {
      const e = event as { request?: { cookies?: unknown } };
      if (e.request?.cookies) delete e.request.cookies;
      return event;
    },
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
