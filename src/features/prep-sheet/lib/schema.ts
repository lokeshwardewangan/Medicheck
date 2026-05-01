import { z } from 'zod';

export const prepSheetSchema = z.object({
  chiefComplaint: z
    .string()
    .min(5)
    .describe('One sentence summarizing why the patient is seeing the doctor'),
  timeline: z
    .array(
      z.object({
        when: z.string().describe('Relative date, e.g. "2 days ago" or "since last week"'),
        description: z.string().describe('What the patient experienced'),
        severity: z.number().int().min(1).max(10).optional(),
      })
    )
    .max(8)
    .describe('Symptom timeline, oldest first, max 8 entries'),
  currentMedications: z.array(z.string()).describe('Medications the patient is currently taking'),
  activeConditions: z.array(z.string()).describe('Known active conditions'),
  allergies: z.array(z.string()),
  questionsForDoctor: z
    .array(z.string())
    .min(2)
    .max(5)
    .describe('Specific, actionable questions the patient should ask. Concrete, not generic.'),
  notes: z
    .string()
    .optional()
    .describe('Anything else worth flagging — recent triage levels, red flags, etc.'),
});

export type PrepSheet = z.infer<typeof prepSheetSchema>;
