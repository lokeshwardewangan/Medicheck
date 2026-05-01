// Emergency keywords for red-flag detection
// These trigger immediate emergency warnings bypassing AI analysis

export const EMERGENCY_KEYWORDS = [
  // Cardiac
  'chest pain',
  'chest tightness',
  'heart attack',
  'cardiac arrest',
  "can't breathe",
  'difficulty breathing',
  'shortness of breath',
  'severe chest',

  // Neurological
  'stroke',
  'seizure',
  'unconscious',
  'passed out',
  'fainted',
  "can't move",
  'paralyzed',
  'slurred speech',
  'sudden confusion',
  'severe headache',
  'thunderclap headache',
  'stiff neck',

  // Trauma
  'severe bleeding',
  'heavy bleeding',
  "bleeding won't stop",
  'gunshot',
  'stab wound',
  'head injury',
  'spinal injury',
  'broken bone',
  'compound fracture',

  // Allergic
  'anaphylaxis',
  "can't swallow",
  'throat closing',
  'severe allergic',
  'swelling face',

  // Pregnancy
  'pregnant bleeding',
  'pregnancy bleeding',
  'miscarriage',

  // Mental Health
  'suicide',
  'kill myself',
  'want to die',
  'end my life',

  // Other Critical
  'poisoning',
  'overdose',
  'severe burn',
  'electrocution',
  'drowning',
  'choking',
  'not breathing',
  'no pulse',
  'blue lips',
  'blue face',
  'cold skin',
];

export const EMERGENCY_RESPONSE = {
  title: 'EMERGENCY - Seek Immediate Medical Attention',
  message: 'Your symptoms may indicate a life-threatening condition. Do not wait.',
  actions: [
    'Call emergency services (108 in India, 911 in US) immediately',
    'Do not drive yourself - call an ambulance',
    'If unconscious, start CPR if trained',
    'Stay on the line with emergency operator',
  ],
  disclaimer:
    'This is an automated emergency detection. When in doubt, always call emergency services.',
};

export function checkEmergencyKeywords(input: string): boolean {
  const lowerInput = input.toLowerCase();
  return EMERGENCY_KEYWORDS.some((keyword) => lowerInput.includes(keyword.toLowerCase()));
}

export function extractEmergencySymptoms(input: string): string[] {
  const lowerInput = input.toLowerCase();
  return EMERGENCY_KEYWORDS.filter((keyword) => lowerInput.includes(keyword.toLowerCase()));
}
