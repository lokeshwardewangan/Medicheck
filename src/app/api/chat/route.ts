import 'server-only';
import { generateObject } from 'ai';
import { z } from 'zod';
import { headers } from 'next/headers';
import { defaultModel, defaultModelLabel } from '@/server/ai';
import { auth } from '@/server/auth/auth';
import { recordAiCall } from '@/server/audit/ai-logger';

const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1),
      })
    )
    .min(1),
});

const responseSchema = z.object({
  message: z.string().describe('Your reply to the user, in plain language'),
  isEmergency: z
    .boolean()
    .describe(
      'True only if the user just described a life-threatening symptom that needs immediate emergency care'
    ),
});

const SYSTEM_PROMPT = `You are a medical triage assistant for an Indian patient-companion app.

Rules:
- NEVER provide definitive diagnoses.
- Be empathetic, clear, and concise.
- Ask one question at a time to gather information.
- Always prioritize safety; when in doubt, recommend higher urgency.
- If the user mentions any life-threatening symptom (chest pain, stroke signs, severe bleeding, suicide intent, anaphylaxis, etc.), set isEmergency to true and tell them to call emergency services immediately.
- Use plain language. Avoid medical jargon unless you also explain it.`;

const FALLBACK = {
  message: 'I apologize, but I had trouble processing that. Could you rephrase?',
  isEmergency: false,
} as const;

const FEATURE = 'chat';

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'Invalid request', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const promptForLogging = parsed.data.messages.map((m) => `${m.role}: ${m.content}`).join('\n');
  const startedAt = Date.now();

  try {
    const result = await generateObject({
      model: defaultModel,
      schema: responseSchema,
      system: SYSTEM_PROMPT,
      messages: parsed.data.messages,
    });

    await recordAiCall({
      userId: session.user.id,
      feature: FEATURE,
      model: defaultModelLabel,
      prompt: promptForLogging,
      status: 'success',
      tokensIn: result.usage?.inputTokens,
      tokensOut: result.usage?.outputTokens,
      latencyMs: Date.now() - startedAt,
    });

    return Response.json(result.object);
  } catch (error) {
    await recordAiCall({
      userId: session.user.id,
      feature: FEATURE,
      model: defaultModelLabel,
      prompt: promptForLogging,
      status: 'fallback',
      latencyMs: Date.now() - startedAt,
      fallbackUsed: true,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    console.error('[api/chat] generation failed:', error);
    return Response.json(FALLBACK);
  }
}
