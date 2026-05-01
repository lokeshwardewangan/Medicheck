import { z } from 'zod';

// User Profile Schema
export const userProfileSchema = z.object({
  age: z.number().min(1).max(120).describe('Age in years'),
  sex: z.enum(['male', 'female', 'other']),
  existingConditions: z.array(z.string()).default([]),
  medications: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
});

export type UserProfileSchema = z.infer<typeof userProfileSchema>;

// Symptom Input Schema
export const symptomInputSchema = z.object({
  name: z.string().min(2, 'Symptom name must be at least 2 characters').max(100),
  bodyPart: z.string().optional(),
  severity: z.number().min(1).max(10),
  duration: z.string().min(1, 'Please specify duration'),
  description: z.string().max(500).optional(),
});

export type SymptomInputSchema = z.infer<typeof symptomInputSchema>;

// Chat Message Schema
export const chatMessageSchema = z.object({
  content: z.string().min(1, 'Please enter a message').max(1000),
});

export type ChatMessageSchema = z.infer<typeof chatMessageSchema>;

// Follow-up Answer Schema
export const followUpAnswerSchema = z.record(z.string(), z.string());

export type FollowUpAnswerSchema = z.infer<typeof followUpAnswerSchema>;

// Assessment Session Schema
export const assessmentSessionSchema = z.object({
  symptoms: z.array(symptomInputSchema).min(1, 'At least one symptom is required'),
  followUpAnswers: followUpAnswerSchema.default({}),
  profile: userProfileSchema.nullable(),
});

export type AssessmentSessionSchema = z.infer<typeof assessmentSessionSchema>;

// Follow-up Question Schema
export const followUpQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  type: z.enum(['single_choice', 'multiple_choice', 'text', 'number', 'boolean']),
  options: z.array(z.string()).optional(),
  required: z.boolean(),
  category: z.enum(['duration', 'severity', 'history', 'lifestyle', 'other']),
});

export const followUpQuestionsSchema = z.array(followUpQuestionSchema);

export type FollowUpQuestionSchema = z.infer<typeof followUpQuestionSchema>;

// Triage Result Schema (for API validation)
export const triageResultSchema = z.object({
  level: z.enum(['emergency', 'urgent', 'routine', 'self_care']),
  title: z.string(),
  description: z.string(),
  explanation: z.array(z.string()),
  nextSteps: z.array(
    z.object({
      id: z.string(),
      action: z.string(),
      details: z.string().optional(),
      priority: z.number(),
      isEmergency: z.boolean().optional(),
    })
  ),
  disclaimer: z.string(),
});

export type TriageResultSchema = z.infer<typeof triageResultSchema>;

// Feedback Schema
export const feedbackSchema = z.object({
  sessionId: z.string(),
  feedback: z.enum(['helpful', 'not_helpful']),
  comment: z.string().optional(),
});

export type FeedbackSchema = z.infer<typeof feedbackSchema>;

// Emergency Keywords Schema
export const emergencyCheckSchema = z.object({
  symptoms: z.array(z.string()),
  message: z.string(),
});

export type EmergencyCheckSchema = z.infer<typeof emergencyCheckSchema>;
