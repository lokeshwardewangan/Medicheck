import 'server-only';
import { generateObject } from 'ai';
import { defaultModel, defaultModelLabel } from '@/server/ai';
import { triageResultSchema } from '@/lib/schema';
import { recordAiCall } from '@/server/audit/ai-logger';
import type { ChatMessage, TriageResult, UserProfile, Symptom } from '@/types';

const FEATURE = 'triage';

const SYSTEM_PROMPT = `You are a clinical triage assistant for an Indian patient-companion app. Your job is to recommend the appropriate level of care based ONLY on what the patient explicitly told you.

CRITICAL RULES — DO NOT VIOLATE
1. NEVER invent, assume, or extrapolate patient details that were not explicitly provided.
   - If "Age: not provided" — do NOT assume infant, child, adolescent, adult, elderly, or any specific age. Treat the patient as an adult of unspecified age.
   - If "Sex: not provided" — do NOT assume male, female, or any sex.
   - If "Existing conditions: not provided" — do NOT speculate about underlying conditions.
   - Do NOT mention or factor in any demographic detail that wasn't given.
2. NEVER provide a definitive diagnosis or name a specific disease. You may describe symptom patterns and the level of care needed.
3. Base your assessment STRICTLY on the patient's own words in the conversation and follow-up answers. Do not introduce facts that are not in the input.
4. Always prioritize safety: when genuinely uncertain, recommend a higher urgency level — but uncertainty about missing demographic data does NOT justify escalation by itself.
5. Use plain, simple language. No jargon unless you explain it in parentheses.

TRIAGE LEVELS
- emergency: Life-threatening signs (e.g. chest pain spreading to arm/jaw, sudden one-sided weakness, severe trouble breathing, severe uncontrolled bleeding, suicidal intent, anaphylaxis). Call emergency services immediately.
- urgent: Needs medical attention within 24 hours.
- routine: Schedule a doctor visit within a few days.
- self_care: Can be safely managed at home with monitoring.

OUTPUT
- title: A short, specific summary of what's happening (e.g. "Persistent headache with no red-flag features", NOT a diagnosis like "Migraine").
- description: 1-2 plain-language sentences. Do NOT invent demographics.
- explanation: 2-4 bullet points justifying the level. Cite the patient's own statements ("You reported the pain has been getting worse for 3 days…"). If a critical detail like age is missing and could change the recommendation, add a final bullet: "Note: age was not provided; if the patient is a child under 12 or over 65, please reconsult."
- nextSteps: 2-4 concrete actions, most important first.
- disclaimer: Standard medical-information disclaimer.`;

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

function renderProfile(profile: UserProfile | null): string {
  if (!profile) {
    return [
      '- Age: not provided',
      '- Sex: not provided',
      '- Existing conditions: not provided',
      '- Medications: not provided',
      '- Allergies: not provided',
    ].join('\n');
  }
  const list = (xs: string[]) => (xs.length ? xs.join(', ') : 'none reported');
  return [
    `- Age: ${profile.age == null ? 'not provided' : `${profile.age} years`}`,
    `- Sex: ${profile.sex ?? 'not provided'}`,
    `- Existing conditions: ${list(profile.existingConditions)}`,
    `- Medications: ${list(profile.medications)}`,
    `- Allergies: ${list(profile.allergies)}`,
  ].join('\n');
}

function renderTranscript(chatMessages: ChatMessage[]): string {
  const lines = chatMessages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => `${m.role === 'user' ? 'Patient' : 'Assistant'}: ${m.content}`);
  return lines.length ? lines.join('\n\n') : '(no conversation captured)';
}

function renderSymptoms(symptoms: Symptom[]): string {
  if (!symptoms.length) return '(none captured separately — see conversation above)';
  return symptoms
    .map(
      (s) =>
        `- ${s.name} (severity ${s.severity}/10, duration ${s.duration})${
          s.description ? ` — ${s.description}` : ''
        }`
    )
    .join('\n');
}

function renderAnswers(answers: Record<string, string>): string {
  const entries = Object.entries(answers);
  if (!entries.length) return '(none)';
  return entries.map(([k, v]) => `- ${k}: ${v}`).join('\n');
}

function buildPrompt(
  symptoms: Symptom[],
  followUpAnswers: Record<string, string>,
  profile: UserProfile | null,
  chatMessages: ChatMessage[]
): string {
  return `Patient profile:
${renderProfile(profile)}

Conversation with the patient:
${renderTranscript(chatMessages)}

Structured symptoms (if separately captured):
${renderSymptoms(symptoms)}

Follow-up answers:
${renderAnswers(followUpAnswers)}

Produce a triage assessment based STRICTLY on the patient's own words above. Do not invent demographics or facts that are not present.`;
}

export type GenerateTriageInput = {
  symptoms: Symptom[];
  followUpAnswers: Record<string, string>;
  profile: UserProfile | null;
  chatMessages?: ChatMessage[];
  userId?: string | null;
};

export async function generateTriage(input: GenerateTriageInput): Promise<TriageResult> {
  const { symptoms, followUpAnswers, profile, chatMessages = [], userId = null } = input;
  const prompt = buildPrompt(symptoms, followUpAnswers, profile, chatMessages);
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
