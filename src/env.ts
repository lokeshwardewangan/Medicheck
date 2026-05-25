import 'server-only';
import { z } from 'zod';

// Empty strings in .env (e.g. `NEXT_PUBLIC_SENTRY_DSN=`) bypass .optional()
// and hit .url() validation. Normalize them to undefined first.
const optionalUrl = z.preprocess((v) => (v === '' ? undefined : v), z.string().url().optional());
const optionalString = z.preprocess((v) => (v === '' ? undefined : v), z.string().optional());

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Required: app does not function without these.
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 chars'),
  BETTER_AUTH_URL: z.string().url().default('http://localhost:3000'),

  // Soft-required: features fail loudly when used without these, but the
  // app can boot for local development without them set.
  GEMINI_API_KEY: optionalString,
  RESEND_API_KEY: optionalString,
  RESEND_FROM_EMAIL: z.string().email().default('onboarding@resend.dev'),

  // Browser-visible.
  NEXT_PUBLIC_APP_URL: optionalUrl,
  NEXT_PUBLIC_SENTRY_DSN: optionalUrl,
});

const result = schema.safeParse(process.env);

if (!result.success) {
  const issues = result.error.flatten().fieldErrors;
  console.error('[env] invalid environment variables:');
  for (const [key, msgs] of Object.entries(issues)) {
    console.error(`  - ${key}: ${msgs?.join(', ')}`);
  }
  throw new Error('Invalid environment variables — see logs above and check .env.local');
}

export const env = result.data;
export type Env = typeof env;
