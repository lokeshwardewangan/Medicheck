import 'server-only';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const apiKey = process.env.GEMINI_API_KEY ?? '';

if (!apiKey) {
  console.warn('[ai] GEMINI_API_KEY is not set — AI calls will fail');
}

export const google = createGoogleGenerativeAI({ apiKey });

export const models = {
  fast: google('gemini-1.5-flash'),
  pro: google('gemini-1.5-pro'),
} as const;

export type ModelKey = keyof typeof models;

export const defaultModel = models.fast;
