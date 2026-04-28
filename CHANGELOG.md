# Changelog

All notable changes to MediCheck land here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-04-28

First production-targeted release. Turns a client-only symptom chatbot into a household health vault built for the 10–15 minute Indian outpatient consultation.

### Added

#### Hero feature
- **Pre-Visit Prep Sheet** at `/prep` — generates a structured one-page summary from the current member's profile and the last 14 days of logged symptoms; download as PDF via `@react-pdf/renderer`. Output is constrained by a Zod schema (chief complaint, timeline, current meds, active conditions, allergies, questions to ask the doctor, notes).

#### Auth + tenancy
- Magic-link auth via **Better-Auth** + **Resend** (email delivery). Sandbox sender works out of the box; production needs a verified domain.
- Multi-tenant **household** model: every new user gets a household + a primary "Self" member auto-provisioned on first sign-in.
- **Member CRUD** at `/members` with React Hook Form + Zod validation; primary member is protected from deletion.
- **Member switcher** in the app shell — cookie-backed "current member" so subsequent health actions are scoped to one person.
- Route groups: `(public)` for marketing, `(auth)` for login/verify, `(app)` for the authed shell.

#### Data layer
- **Drizzle ORM + Postgres** with `drizzle-kit` migrations. `docker-compose.yml` for local Postgres in one command.
- **Postgres Row-Level Security** with `FORCE ROW LEVEL SECURITY` on all PHI tables. Policies key off `current_setting('app.user_id', true)` set per-request by `withUserContext`. Even buggy app code cannot leak across households.
- Persistent assessment timeline: chat messages, symptoms, follow-up answers, and triage results all land in Postgres in a single transaction at submission.
- `/history` is now a server-rendered page reading from the DB instead of localStorage.

#### AI
- All Gemini calls moved server-side via the **Vercel AI SDK** + `@ai-sdk/google`. `GEMINI_API_KEY` no longer ships to the browser.
- Triage, follow-up questions, chat, and prep sheet generation all use `generateObject` with Zod-validated structured output — no regex JSON extraction, no string interpolation surprises.
- AI routes require an active session before invoking the model (prevents anonymous API-key drain).
- Triage prompt extracted to a shared server module (`src/server/triage/generate.ts`) shared by `/api/triage` and the assessment submission action.

#### Observability + audit
- `ai_call` table logs every model invocation: feature, model, prompt hash (SHA-256), tokens in/out, latency, cache hit, fallback flag, status, error.
- `audit_log` table records every PHI access (create/read/update/delete on members and assessments) with IP and user-agent.
- **Sentry** wired via Next.js instrumentation — opt-in via `NEXT_PUBLIC_SENTRY_DSN`; app boots fine without it.
- Typed env validation in `src/env.ts` — missing or malformed env vars fail at boot with a clear list of issues.

#### Safety
- Emergency keyword screening still runs on the client **before** any AI call (carried forward from the original chatbot). The pre-AI red-flag gate is now backed by a longitudinal record so repeat patterns are detectable in v1.1+.

### Changed
- Folder structure reorganized to feature-based (`src/features/<name>` for chat, assessment, triage, members, prep-sheet, history, landing). Cross-cutting infra lives in `src/server/`.
- README rewritten with local setup, scripts table, environment-variable reference, and production deployment notes (Neon + Vercel + Resend + Sentry).
- Bun is the canonical package manager (`bun.lock` committed; `package-lock.json` removed).

### Removed
- Direct `@google/generative-ai` browser usage. The `chatWithAI`, `analyzeSymptoms`, and `generateFollowUpQuestions` browser helpers were deleted; the corresponding server routes replace them.
- `NEXT_PUBLIC_GEMINI_API_KEY` — replaced with server-only `GEMINI_API_KEY`.
- `CLAUDE.md` and `AGENTS.md` are no longer tracked in git (still on disk locally).

### Security
- `NEXT_PUBLIC_GEMINI_API_KEY` was a real production risk in pre-1.0; it shipped the Gemini key to every browser. v1.0.0 closes that surface entirely.
- All AI API routes now require an authenticated session before invoking the model.
- Postgres RLS provides defense-in-depth: cross-household reads are physically impossible at the DB layer, not just blocked by app code.

### Known limitations (deferred to v1.1+)
- No caregiver delegation / Parivar mode (separate user inviting another into a household).
- No prescription OCR / lab report translator yet.
- No WhatsApp delivery for reminders; magic-link only via email.
- No ABHA integration.
- No multilingual UI (English only).
- Source-map upload to Sentry not wired (`withSentryConfig` wrap pending).
- `@ai-sdk/google`'s `generateObject` will be migrated to the AI SDK v6 successor API.
