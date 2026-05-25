import 'server-only';
import { generateObject } from 'ai';
import { defaultModel, defaultModelLabel } from '@/server/ai';
import { triageResultSchema } from '@/lib/schema';
import { recordAiCall } from '@/server/audit/ai-logger';
import type { TriageResult, UserProfile, Symptom } from '@/types';

const FEATURE = 'triage';

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

function buildPrompt(
  symptoms: Symptom[],
  followUpAnswers: Record<string, string>,
  profile: UserProfile | null
): string {
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

export async function generateTriage(
  symptoms: Symptom[],
  followUpAnswers: Record<string, string>,
  profile: UserProfile | null,
  userId?: string | null
): Promise<TriageResult> {
  const prompt = buildPrompt(symptoms, followUpAnswers, profile);
  const startedAt = Date.now();

  try {
    const result = await generateObject({
      model: defaultModel,
      schema: triageResultSchema,
      system: SYSTEM_PROMPT,
      prompt,
    });

    await recordAiCall({
      userId,
      feature: FEATURE,
      model: defaultModelLabel,
      prompt,
      status: 'success',
      tokensIn: result.usage?.inputTokens,
      tokensOut: result.usage?.outputTokens,
      latencyMs: Date.now() - startedAt,
    });

    return result.object;
  } catch (error) {
    await recordAiCall({
      userId,
      feature: FEATURE,
      model: defaultModelLabel,
      prompt,
      status: 'fallback',
      latencyMs: Date.now() - startedAt,
      fallbackUsed: true,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    console.error('[triage] generation failed, using fallback:', error);
    return FALLBACK;
  }
}
