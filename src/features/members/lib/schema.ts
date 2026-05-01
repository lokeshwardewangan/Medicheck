import { z } from 'zod';

const ageField = z.preprocess((v) => {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}, z.number().int().min(0, 'Age must be 0 or greater').max(120, 'Age must be 120 or less').nullable());

const sexField = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? null : v),
  z.enum(['male', 'female', 'other']).nullable()
);

export const memberFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  relation: z.enum(['self', 'spouse', 'child', 'parent', 'sibling', 'other']),
  age: ageField,
  sex: sexField,
});

export type MemberFormInput = z.input<typeof memberFormSchema>;
export type MemberFormValues = z.output<typeof memberFormSchema>;

export const RELATION_LABELS: Record<MemberFormValues['relation'], string> = {
  self: 'Self',
  spouse: 'Spouse',
  child: 'Child',
  parent: 'Parent',
  sibling: 'Sibling',
  other: 'Other',
};

export const SEX_LABELS: Record<NonNullable<MemberFormValues['sex']>, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
};
