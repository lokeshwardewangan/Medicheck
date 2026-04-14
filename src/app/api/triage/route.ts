import 'server-only';
import { generateObject } from 'ai';
import { z } from 'zod';
import { defaultModel } from '@/server/ai';
import { triageResultSchema, userProfileSchema } from '@/lib/schema';
import type { TriageResult } from '@/types';

const symptomInput = z.object({
  id: z.string(),
  name: z.string().min(1),
  bodyPart: z.string().optional(),
  severity: z.number().min(1).max(10),
  duration: z.string().min(1),
  description: z.string().optional(),
});

const requestSchema = z.object({
  symptoms: z.array(symptomInput).min(1),
  followUpAnswers: z.record(z.string(), z.string()).default({}),
  profile: userProfileSchema.nullable().optional(),
});

const SYSTEM_PROMPT = `You are a medical triage assistant for an Indian patient-companion app.

Rules:
- NEVER provide a definitive diagnosis.
- Always prioritize safety. When uncertain, recommend a higher urgency level.
- Use plain, simple language; avoid jargon unless you explain it.
- Always include an appropriate medical disclaimer.

Triage levels:
- emergency: Life-threatening. Call emergency services immediately.
- urgent: Needs medical attention within 24 hours.
- routine: Schedule a doctor visit within a few days.
- self_care: Can be safely managed at home with monitoring.`;

const FALLBACK: TriageResult = {
  level: 'urgent',
  title: 'Unable to Complete Assessment',
  description:
    'We encountered an error analyzing your symptoms. Please consult a healthcare provider.',
  explanation: ['Technical error occurred', 'Symptoms require professional evaluation'],
  nextSteps: [
    {
      id: '1',
      action: 'Contact a healthcare provider',
      details: 'Schedule an appointment with your doctor or visit a clinic',
      priority: 1,
    },
    {
      id: '2',
      action: 'Monitor your symptoms',
      details: 'Keep track of any changes and seek immediate care if symptoms worsen',
      priority: 2,
    },
  ],
  disclaimer:
    'This is a fallback response due to a technical error. Please consult a healthcare professional for proper evaluation.',
};

function buildPrompt(input: z.infer<typeof requestSchema>): string {
  const { symptoms, followUpAnswers, profile } = input;

  const profileBlock = profile
    ? `- Age: ${profile.age}
- Sex: ${profile.sex}
- Existing Conditions: ${profile.existingConditions.join(', ') || 'None'}
- Medications: ${profile.medications.join(', ') || 'None'}
- Allergies: ${profile.allergies.join(', ') || 'None'}`
    : 'No profile provided';

  const symptomBlock = symptoms
    .map(
      (s) =>
        `- ${s.name} (severity ${s.severity}/10, duration ${s.duration})${
          s.description ? ` — ${s.description}` : ''
        }`
    )
    .join('\n');

  const answersBlock =
    Object.entries(followUpAnswers)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join('\n') || 'None';

  return `Patient profile:
${profileBlock}

Reported symptoms:
${symptomBlock}

Additional information:
${answersBlock}

Produce a triage assessment.`;
}

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
      schema: triageResultSchema,
      system: SYSTEM_PROMPT,
      prompt: buildPrompt(parsed.data),
    });
    return Response.json(result.object satisfies TriageResult);
  } catch (error) {
    console.error('[api/triage] generation failed:', error);
    return Response.json(FALLBACK);
  }
}
