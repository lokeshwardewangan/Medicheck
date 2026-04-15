# MediCheck

Patient-companion app for the Indian outpatient care gap. Built on Next.js 16, React 19, Drizzle + Postgres, and Google Gemini via the Vercel AI SDK.

## Setup

1. Copy `.env.example` to `.env.local` and fill in:
   - `GEMINI_API_KEY` — server-side Gemini key (get from https://aistudio.google.com/apikey).
   - `DATABASE_URL` — Postgres connection string (see below).
2. Install dependencies:
   ```bash
   bun install
   ```
3. Start the local Postgres container:
   ```bash
   docker compose up -d
   ```
   This exposes Postgres on `localhost:5432` with database `medicheck`. The matching `DATABASE_URL` is:
   ```
   postgres://medicheck:medicheck@localhost:5432/medicheck
   ```
4. Run migrations (once a migration exists):
   ```bash
   bun run db:migrate
   ```
5. Start the dev server:
   ```bash
   bun dev
   ```
   App is on http://localhost:3000.

## Scripts

| Script | What it does |
|---|---|
| `bun dev` | Next.js dev server |
| `bun run build` | Production build |
| `bun start` | Run production build |
| `bun run lint` | ESLint |
| `bun run db:generate` | Generate SQL migration from schema changes |
| `bun run db:migrate` | Apply pending migrations to the database |
| `bun run db:push` | Push schema directly (dev only — bypasses migration history) |
| `bun run db:studio` | Open Drizzle Studio (browser UI for the database) |

## Production database

For deployment, use [Neon](https://neon.tech) — the `postgres-js` driver in [src/db/client.ts](src/db/client.ts) speaks standard Postgres protocol and works with any provider. Just replace `DATABASE_URL` with the Neon connection string.
