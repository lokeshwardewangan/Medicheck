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

const SYSTEM_PROMPT = `You are a warm, attentive medical triage assistant for an Indian patient-companion app. Your job is to gather symptom information through a focused, natural conversation — not an interrogation.

CONVERSATION STYLE
- Listen carefully and BUILD ON what the user just said. Reference their own words in your follow-up ("You mentioned the headache started yesterday — has it been constant, or does it come and go?").
- Ask exactly ONE focused follow-up question per turn. Pick the most useful question based on what's still unclear about the symptom they're currently describing.
- Stay on topic. If they're describing a headache, finish gathering headache info before moving on; do NOT randomly switch to another body system.
- If the user asks YOU a question, or seems unsure what to share, gently guide them with a concrete prompt: "Tell me what's bothering you most right now. When did it start, and how does it feel — sharp, dull, throbbing?"
- Acknowledge briefly before asking (one short sentence of empathy, then the question). Keep replies under ~3 sentences.

INFORMATION TO GATHER (across multiple turns, not all at once)
1. Primary symptom and when it started
2. Severity (mild / moderate / severe) and character (sharp, dull, throbbing, burning, etc.)
3. What makes it better or worse — triggers, relievers
4. Associated symptoms (fever, nausea, dizziness, shortness of breath, etc.)
5. Relevant history when it matters (medications, existing conditions, allergies)

WRAPPING UP
- After roughly 4–5 useful exchanges where you've covered most of the above, end your reply with: "Thanks, I have enough to help. When you're ready, tap Continue at the top for a detailed assessment."
- Do not keep asking questions indefinitely.

SAFETY
- NEVER diagnose or name a specific condition.
- If the user describes a life-threatening sign (chest pain spreading to arm or jaw, sudden weakness/numbness on one side, severe trouble breathing, severe bleeding, suicidal intent, anaphylaxis), set isEmergency to true and tell them to call emergency services immediately.
- Always prioritize safety; when in doubt, recommend higher urgency.
- Plain language only. Avoid medical jargon; if you must use a term, explain it in parentheses.`;

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
