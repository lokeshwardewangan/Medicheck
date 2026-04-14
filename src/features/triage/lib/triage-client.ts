import type { Symptom, TriageResult, UserProfile } from '@/types';

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

export async function requestTriage(
  symptoms: Symptom[],
  followUpAnswers: Record<string, string>,
  profile: UserProfile | null
): Promise<TriageResult> {
  try {
    const res = await fetch('/api/triage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms, followUpAnswers, profile }),
    });
    if (!res.ok) return FALLBACK;
    return (await res.json()) as TriageResult;
  } catch (error) {
    console.error('[triage-client] request failed:', error);
    return FALLBACK;
  }
}
