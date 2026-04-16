import { defineConfig } from 'drizzle-kit';

// DATABASE_URL is only required for `migrate`, `push`, `pull`, and `studio`.
// `generate` works offline by diffing schema files against the migrations folder.
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema',
  out: './src/db/migrations',
  dbCredentials: { url: process.env.DATABASE_URL ?? '' },
  strict: true,
  verbose: true,
});
