# HealthMate

Patient-companion app for the Indian outpatient care gap. Built on Next.js 16, React 19, Drizzle + Postgres, Better-Auth, and Google Gemini via the Vercel AI SDK.

The hero feature is the **Pre-Visit Prep Sheet** — generate a one-page PDF from your logged symptoms + profile to take to a 10–15 minute Indian outpatient appointment.

## Local setup

1. Copy `.env.example` to `.env.local` and fill in the required keys (see [Environment variables](#environment-variables) below).
2. Install dependencies and start Postgres:
   ```bash
   bun install
   docker compose up -d
   ```
3. Apply migrations:
   ```bash
   bun run db:migrate
   ```
4. Start the dev server:
   ```bash
   bun dev
   ```
   App is on http://localhost:3000.

## Scripts

| Script                | What it does                                                 |
| --------------------- | ------------------------------------------------------------ |
| `bun dev`             | Next.js dev server                                           |
| `bun run build`       | Production build                                             |
| `bun start`           | Run production build                                         |
| `bun run lint`        | ESLint                                                       |
| `bun run db:generate` | Generate SQL migration from schema changes                   |
| `bun run db:migrate`  | Apply pending migrations to the database                     |
| `bun run db:push`     | Push schema directly (dev only — bypasses migration history) |
| `bun run db:studio`   | Open Drizzle Studio (browser UI for the database)            |

## Environment variables

All env vars are validated at boot via [src/env.ts](src/env.ts). Missing required vars cause a clear startup error.

| Variable                 | Required  | Notes                                                                                                                      |
| ------------------------ | --------- | -------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`           | Yes       | Postgres connection string. For local dev: `postgres://healthmate:healthmate@localhost:5432/healthmate`. Production: Neon. |
| `BETTER_AUTH_SECRET`     | Yes       | Session signing secret. Generate with `openssl rand -base64 32`.                                                           |
| `BETTER_AUTH_URL`        | Defaulted | Public origin where the app is served. Defaults to `http://localhost:3000`.                                                |
| `GEMINI_API_KEY`         | Soft      | Without it, AI calls fail; the app still boots. Get from https://aistudio.google.com/apikey.                               |
| `RESEND_API_KEY`         | Soft      | Required to send magic-link emails. Sign up at https://resend.com.                                                         |
| `RESEND_FROM_EMAIL`      | Defaulted | Defaults to `onboarding@resend.dev` (Resend sandbox). For production, verify your own domain.                              |
| `NEXT_PUBLIC_APP_URL`    | Optional  | Used by the browser auth client; falls back to `window.location.origin`.                                                   |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional  | If set, errors are reported to Sentry. App boots fine without.                                                             |

⚠️ Never commit `.env.local`. `.env.example` exists for documentation only — never paste a real key into it.

## Production deployment

**Database (Neon):**

1. Create a Neon project.
2. Copy the pooled connection string (with `?sslmode=require`).
3. Set as `DATABASE_URL` in your hosting environment.
4. After each deploy that ships a new migration, run `bun run db:migrate` against the production DB.

**App (Vercel):**

1. Push to GitHub.
2. Import the repo in Vercel.
3. Add all required env vars (see table above).
4. Deploy.

**Email (Resend):**

1. Sign up at https://resend.com (3,000 emails/month free).
2. Verify your domain and set `RESEND_FROM_EMAIL=login@yourdomain.in`.
3. Until verified, the sandbox `onboarding@resend.dev` works for testing only.

**Observability (Sentry, optional):**

1. Create a Next.js project on Sentry.
2. Set `NEXT_PUBLIC_SENTRY_DSN` in env.
3. For uploaded source maps in production stack traces, wrap `next.config.ts` with `withSentryConfig` and add `SENTRY_AUTH_TOKEN` at build time — left as a v1.1 enhancement.

## Architecture

This is a multi-tenant household health vault, not a one-shot symptom checker.

### Data model

- `user` (Better-Auth) — one row per signup. Magic-link only; no passwords.
- `household` — created automatically on first signup. One per user in v1; caregiver delegation comes later.
- `member` + `member_profile` — patients tracked in a household (self, spouse, kids, parents). `member.isPrimary = true` marks the "Self" member auto-created on signup.
- `assessment` + `assessment_message` + `symptom_entry` + `follow_up_answer` + `triage_result` — one row per completed triage session, linked to a `member`.
- `ai_call` + `audit_log` — every AI invocation and every PHI access is recorded for cost dashboards and GDPR-style "right to know".

### Security

- **Postgres Row-Level Security** is enabled on every PHI table with `FORCE ROW LEVEL SECURITY`. Policies key off `current_setting('app.user_id', true)` set per-transaction by [withUserContext](src/server/db/with-user-context.ts). Even if application code has a bug, the database refuses cross-household reads.
- **All AI calls are server-side** through the gateway at [src/server/ai/gateway.ts](src/server/ai/gateway.ts). `GEMINI_API_KEY` never ships to the browser.
- **All `/api/*` AI routes require an active session** before invoking the model — prevents anonymous abuse of the API key.

### Folder structure

```
src/
├── app/
│   ├── (public)/      # marketing / landing
│   ├── (auth)/        # /login, /verify
│   ├── (app)/         # session-protected app shell
│   └── api/           # AI routes + Better-Auth catch-all
├── features/          # feature-scoped components, lib, server actions
│   ├── auth, members, assessment, chat, triage, history, landing, prep-sheet
├── server/            # cross-cutting infra (only callable server-side)
│   ├── ai/            # AI gateway + provider config
│   ├── auth/          # Better-Auth instance + session + bootstrap
│   ├── audit/         # AI call + PHI access loggers
│   ├── db/            # withUserContext (RLS) helper
│   ├── email/         # Resend wrapper
│   ├── triage/        # Triage prompt + structured-output generator
│   └── prep-sheet/    # Prep sheet generator
├── db/
│   ├── client.ts      # Drizzle Postgres client
│   ├── schema/        # auth, household, assessment, audit (one per feature)
│   └── migrations/    # drizzle-kit output, committed
├── components/
│   ├── ui/            # shadcn primitives
│   ├── layout/        # navbar, footer
│   └── shared/        # loading, error
├── lib/               # utils, shared zod schemas
└── env.ts             # Validated, typed env (server-only)
```
