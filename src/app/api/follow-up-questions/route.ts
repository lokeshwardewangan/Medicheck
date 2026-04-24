import 'server-only';
import { generateObject } from 'ai';
import { z } from 'zod';
import { headers } from 'next/headers';
import { defaultModel } from '@/server/ai';
import { auth } from '@/server/auth/auth';
import { recordAiCall } from '@/server/audit/ai-logger';
import { followUpQuestionsSchema } from '@/lib/schema';
import type { FollowUpQuestion } from '@/types';

const requestSchema = z.object({
  symptoms: z
    .array(
      z.object({
        name: z.string().min(1),
        bodyPart: z.string().optional(),
      })
    )
    .min(1),
  previousAnswers: z.record(z.string(), z.string()).default({}),
});

const SYSTEM_PROMPT = `You are a medical triage assistant. Generate concise follow-up questions to better assess a patient's symptoms.

Rules:
- Ask 3 to 5 high-signal questions only.
- Focus on duration, severity progression, associated symptoms, and risk factors.
- Use plain language. No jargon.`;

const FALLBACK: FollowUpQuestion[] = [
  {
    id: 'duration',
    question: 'How long have you been experiencing these symptoms?',
    type: 'single_choice',
    options: ['Less than a day', '1-3 days', '1 week', 'More than a week', 'More than a month'],
    required: true,
    category: 'duration',
  },
  {
    id: 'progression',
    question: 'Are your symptoms getting better, worse, or staying the same?',
    type: 'single_choice',
    options: ['Getting better', 'Staying the same', 'Getting worse', 'Comes and goes'],
    required: true,
    category: 'other',
  },
  {
    id: 'medications',
    question: 'Have you taken any medications for these symptoms?',
    type: 'boolean',
    required: false,
    category: 'history',
  },
];

const MODEL_LABEL = 'gemini-1.5-flash';
const FEATURE = 'follow_up_questions';

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

  const symptomList = parsed.data.symptoms
    .map((s) => `- ${s.name}${s.bodyPart ? ` (${s.bodyPart})` : ''}`)
    .join('\n');

  const answersBlock =
    Object.entries(parsed.data.previousAnswers)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join('\n') || 'None';

  const prompt = `Reported symptoms:\n${symptomList}\n\nPrevious answers:\n${answersBlock}`;
  const startedAt = Date.now();

  try {
    const result = await generateObject({
      model: defaultModel,
      schema: followUpQuestionsSchema,
      system: SYSTEM_PROMPT,
      prompt,
    });

    await recordAiCall({
      userId: session.user.id,
      feature: FEATURE,
      model: MODEL_LABEL,
      prompt,
      status: 'success',
      tokensIn: result.usage?.inputTokens,
      tokensOut: result.usage?.outputTokens,
      latencyMs: Date.now() - startedAt,
    });

    return Response.json(result.object satisfies FollowUpQuestion[]);
  } catch (error) {
    await recordAiCall({
      userId: session.user.id,
      feature: FEATURE,
      model: MODEL_LABEL,
      prompt,
      status: 'fallback',
      latencyMs: Date.now() - startedAt,
      fallbackUsed: true,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    console.error('[api/follow-up-questions] generation failed:', error);
    return Response.json(FALLBACK);
  }
}
