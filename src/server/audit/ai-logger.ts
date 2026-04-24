import 'server-only';
import { createHash } from 'node:crypto';
import { db } from '@/db/client';
import { aiCall } from '@/db/schema/audit';

export type AiCallStatus = 'success' | 'error' | 'fallback';

export interface RecordAiCallInput {
  userId?: string | null;
  feature: string;
  model: string;
  prompt: string;
  status: AiCallStatus;
  tokensIn?: number;
  tokensOut?: number;
  latencyMs: number;
  fallbackUsed?: boolean;
  errorMessage?: string | null;
}

/**
 * Persists a single AI invocation to the ai_call table for cost, latency,
 * and reliability dashboards. Failures here are swallowed — logging must
 * never break user-facing flow.
 */
export async function recordAiCall(input: RecordAiCallInput): Promise<void> {
  const promptHash = createHash('sha256').update(input.prompt).digest('hex');

  try {
    await db.insert(aiCall).values({
      userId: input.userId ?? null,
      feature: input.feature,
      model: input.model,
      promptHash,
      tokensIn: input.tokensIn ?? null,
      tokensOut: input.tokensOut ?? null,
      latencyMs: input.latencyMs,
      cacheHit: false,
      fallbackUsed: input.fallbackUsed ?? false,
      status: input.status,
      errorMessage: input.errorMessage ?? null,
    });
  } catch (error) {
    console.warn('[ai-logger] failed to record call:', error);
  }
}
