import 'server-only';
import { sql } from 'drizzle-orm';
import { db } from '@/db/client';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Runs `fn` inside a transaction with `app.user_id` set to the caller's user id.
 * Postgres RLS policies on user-scoped tables (added from T8 onward) read this
 * setting to enforce household isolation, even if application code has bugs.
 *
 * `SET LOCAL` scopes the variable to the transaction; nothing leaks across
 * pooled connections.
 */
export async function withUserContext<T>(userId: string, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.user_id', ${userId}, true)`);
    return fn(tx);
  });
}
