import 'server-only';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { env } from '@/env';

const apiKey = env.GEMINI_API_KEY ?? '';

if (!apiKey) {
  console.warn('[ai] GEMINI_API_KEY is not set — AI calls will fail');
}

export const google = createGoogleGenerativeAI({ apiKey });

// Single source of truth for model identifiers. Callsites import these for
// audit logging so the recorded label can never drift from the actual model.
export const MODEL_LABELS = {
  fast: 'gemini-2.5-flash',
  pro: 'gemini-2.5-pro',
} as const;

export const models = {
  fast: google(MODEL_LABELS.fast),
  pro: google(MODEL_LABELS.pro),
} as const;

export type ModelKey = keyof typeof models;

export const defaultModel = models.fast;
export const defaultModelLabel = MODEL_LABELS.fast;
