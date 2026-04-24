import 'server-only';
import { headers } from 'next/headers';
import { db } from '@/db/client';
import { auditLog } from '@/db/schema/audit';

export type AuditAction = 'create' | 'read' | 'update' | 'delete';

export interface RecordPhiAccessInput {
  userId: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Records a single PHI access event. Always called from server actions or
 * route handlers — never the browser. Failures are swallowed so a logging
 * outage doesn't break user-facing operations.
 */
export async function recordPhiAccess(input: RecordPhiAccessInput): Promise<void> {
  let ip: string | null = null;
  let ua: string | null = null;
  try {
    const h = await headers();
    ip =
      h.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      h.get('x-real-ip') ??
      null;
    ua = h.get('user-agent');
  } catch {
    // headers() can throw if called outside a request scope; that's fine.
  }

  try {
    await db.insert(auditLog).values({
      userId: input.userId,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId ?? null,
      metadata: input.metadata ?? null,
      ipAddress: ip,
      userAgent: ua,
    });
  } catch (error) {
    console.warn('[phi-logger] failed to record access:', error);
  }
}
