import { GoogleGenerativeAI } from '@google/generative-ai';
import type { TriageResult, FollowUpQuestion, UserProfile, Symptom } from '@/types';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

if (!apiKey) {
  console.warn('Gemini API key not configured');
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.3,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 2048,
  },
});

// System prompt for medical triage
const TRIAGE_SYSTEM_PROMPT = `You are a medical triage assistant. Your role is to:
1. Analyze symptoms and provide appropriate triage levels
2. NEVER provide definitive diagnoses
3. Always prioritize safety - when in doubt, recommend higher urgency
4. Use clear, simple language
5. Include appropriate medical disclaimers

Triage Levels:
- EMERGENCY: Life-threatening, call ambulance immediately
- URGENT: Needs medical attention within 24 hours
- ROUTINE: Schedule doctor visit within few days
- SELF_CARE: Can manage at home, monitor symptoms

Respond in JSON format only.`;

export async function analyzeSymptoms(
  symptoms: Symptom[],
  followUpAnswers: Record<string, string>,
  profile: UserProfile | null
): Promise<TriageResult> {
  const prompt = `
${TRIAGE_SYSTEM_PROMPT}

Patient Profile:
${profile ? `- Age: ${profile.age}
- Sex: ${profile.sex}
- Existing Conditions: ${profile.existingConditions.join(', ') || 'None'}
- Medications: ${profile.medications.join(', ') || 'None'}` : 'No profile provided'}

Reported Symptoms:
${symptoms.map((s) => `- ${s.name} (Severity: ${s.severity}/10, Duration: ${s.duration})${s.description ? ` - ${s.description}` : ''}`).join('\n')}

Additional Information:
${Object.entries(followUpAnswers).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

Provide a triage assessment in this exact JSON format:
{
  "level": "emergency|urgent|routine|self_care",
  "title": "Brief title describing the situation",
  "description": "2-3 sentence description of the assessment",
  "explanation": ["Factor 1 influencing decision", "Factor 2 influencing decision"],
  "nextSteps": [
    {"id": "1", "action": "First step to take", "details": "Optional details", "priority": 1, "isEmergency": false},
    {"id": "2", "action": "Second step", "priority": 2}
  ],
  "disclaimer": "Medical disclaimer text"
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }

    const triageResult: TriageResult = JSON.parse(jsonMatch[0]);
    return triageResult;
  } catch (error) {
    console.error('Error analyzing symptoms:', error);

    // Fallback response
    return {
      level: 'urgent',
      title: 'Unable to Complete Assessment',
      description: 'We encountered an error analyzing your symptoms. Please consult a healthcare provider.',
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
      disclaimer: 'This is a fallback response due to a technical error. Please consult a healthcare professional for proper evaluation.',
    };
  }
}

export async function generateFollowUpQuestions(
  symptoms: Symptom[],
  previousAnswers: Record<string, string>
): Promise<FollowUpQuestion[]> {
  const prompt = `
${TRIAGE_SYSTEM_PROMPT}

Based on these symptoms:
${symptoms.map((s) => `- ${s.name}`).join('\n')}

Generate 3-5 relevant follow-up questions to better assess the situation.
Focus on: duration, severity progression, associated symptoms, and risk factors.

Respond in JSON format:
[
  {
    "id": "q1",
    "question": "Question text",
    "type": "single_choice|text|boolean",
    "options": ["option1", "option2"],
    "required": true,
    "category": "duration|severity|history|lifestyle|other"
  }
]`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return getDefaultQuestions();
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error generating questions:', error);
    return getDefaultQuestions();
  }
}

function getDefaultQuestions(): FollowUpQuestion[] {
  return [
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
}
