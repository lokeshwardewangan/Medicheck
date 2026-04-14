import type { FollowUpQuestion, Symptom } from '@/types';

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

export async function requestFollowUpQuestions(
  symptoms: Pick<Symptom, 'name' | 'bodyPart'>[],
  previousAnswers: Record<string, string> = {}
): Promise<FollowUpQuestion[]> {
  try {
    const res = await fetch('/api/follow-up-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms, previousAnswers }),
    });
    if (!res.ok) return FALLBACK;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return FALLBACK;
    return data as FollowUpQuestion[];
  } catch (error) {
    console.error('[follow-up-client] request failed:', error);
    return FALLBACK;
  }
}
