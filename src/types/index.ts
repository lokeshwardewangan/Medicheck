// User Profile Types
export interface UserProfile {
  id: string;
  age: number;
  sex: 'male' | 'female' | 'other';
  existingConditions: string[];
  medications: string[];
  allergies: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isEmergency?: boolean;
}

// Symptom Types
export interface Symptom {
  id: string;
  name: string;
  bodyPart?: string;
  severity: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  duration: string;
  description?: string;
}

// Assessment Types
export interface AssessmentSession {
  id: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  currentStep: number;
  totalSteps: number;
  symptoms: Symptom[];
  followUpAnswers: Record<string, string>;
  profile: UserProfile | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FollowUpQuestion {
  id: string;
  question: string;
  type: 'single_choice' | 'multiple_choice' | 'text' | 'number' | 'boolean';
  options?: string[];
  required: boolean;
  category: 'duration' | 'severity' | 'history' | 'lifestyle' | 'other';
}

// Triage Types
export type TriageLevel = 'emergency' | 'urgent' | 'routine' | 'self_care';

export interface TriageResult {
  level: TriageLevel;
  title: string;
  description: string;
  explanation: string[];
  nextSteps: NextStep[];
  disclaimer: string;
}

export interface NextStep {
  id: string;
  action: string;
  details?: string;
  priority: number;
  isEmergency?: boolean;
}

// History Types
export interface SymptomCheckHistory {
  id: string;
  sessionId: string;
  symptoms: string[];
  triageLevel: TriageLevel;
  result: TriageResult;
  createdAt: Date;
  feedback?: 'helpful' | 'not_helpful';
}

// API Response Types
export interface AnalyzeSymptomsResponse {
  triage: TriageResult;
  followUpQuestions?: FollowUpQuestion[];
  isComplete: boolean;
}

export interface ChatResponse {
  message: string;
  isEmergency: boolean;
  suggestedQuestions?: string[];
}

// Component Props Types
export interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export interface TriageCardProps {
  result: TriageResult;
  onFeedback?: (feedback: 'helpful' | 'not_helpful') => void;
}

export interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export interface EmergencyAlertProps {
  symptoms: string[];
  onDismiss?: () => void;
}
