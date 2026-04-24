import { pgTable, text, timestamp, uuid, integer, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { user } from './auth';

export const aiCallStatus = pgEnum('ai_call_status', ['success', 'error', 'fallback']);
export const auditAction = pgEnum('audit_action', ['create', 'read', 'update', 'delete']);

// Every AI invocation lands here: model, prompt hash, tokens, latency, outcome.
// No RLS — system-only writes; reads go through application code that filters by userId.
export const aiCall = pgTable('ai_call', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  feature: text('feature').notNull(),
  model: text('model').notNull(),
  promptHash: text('prompt_hash').notNull(),
  tokensIn: integer('tokens_in'),
  tokensOut: integer('tokens_out'),
  latencyMs: integer('latency_ms').notNull(),
  cacheHit: boolean('cache_hit').notNull().default(false),
  fallbackUsed: boolean('fallback_used').notNull().default(false),
  status: aiCallStatus('status').notNull(),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Every PHI access (member, profile, assessment, triage) is logged here for compliance.
// Append-only; deletion only on user-account purge (cascade).
export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  action: auditAction('action').notNull(),
  resourceType: text('resource_type').notNull(),
  resourceId: text('resource_id'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type AiCall = typeof aiCall.$inferSelect;
export type NewAiCall = typeof aiCall.$inferInsert;
export type AuditLog = typeof auditLog.$inferSelect;
export type NewAuditLog = typeof auditLog.$inferInsert;
