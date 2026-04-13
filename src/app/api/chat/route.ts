import 'server-only';
import { generateObject } from 'ai';
import { z } from 'zod';
import { defaultModel } from '@/server/ai';

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

  try {
    const result = await generateObject({
      model: defaultModel,
      schema: responseSchema,
      system: SYSTEM_PROMPT,
      messages: parsed.data.messages,
    });
    return Response.json(result.object);
  } catch (error) {
    console.error('[api/chat] generation failed:', error);
    return Response.json(FALLBACK);
  }
}
