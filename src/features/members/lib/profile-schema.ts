import { z } from 'zod';

const ageField = z.preprocess(
  (v) => {
    if (v === '' || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  },
  z
    .number({ message: 'Age is required' })
    .int('Age must be a whole number')
    .min(0, 'Age must be 0 or greater')
    .max(120, 'Age must be 120 or less')
);

const sexField = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? null : v),
  z.enum(['male', 'female', 'other'], { message: 'Sex is required' })
);

// Comma-separated text → array of trimmed non-empty strings. Empty string → [].
const csvList = z.preprocess(
  (v) => {
    if (Array.isArray(v)) return v;
    if (typeof v !== 'string') return [];
    return v
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  },
  z.array(z.string().min(1)).default([])
);

export const quickProfileSchema = z.object({
  age: ageField,
  sex: sexField,
  existingConditions: csvList,
  medications: csvList,
  allergies: csvList,
});

export type QuickProfileInput = z.input<typeof quickProfileSchema>;
export type QuickProfileValues = z.output<typeof quickProfileSchema>;
