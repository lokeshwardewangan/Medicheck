import 'server-only';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

declare global {
  // eslint-disable-next-line no-var
  var __pg_client: ReturnType<typeof postgres> | undefined;
}

const client =
  globalThis.__pg_client ??
  postgres(connectionString, {
    max: 1,
    prepare: false,
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__pg_client = client;
}

export const db: PostgresJsDatabase<typeof schema> = drizzle(client, { schema });
export type Db = typeof db;
