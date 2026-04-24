import 'server-only';
import { z } from 'zod';
import { headers } from 'next/headers';
import { userProfileSchema } from '@/lib/schema';
import { generateTriage } from '@/server/triage/generate';
import { auth } from '@/server/auth/auth';
import type { Symptom, UserProfile } from '@/types';

const symptomInput = z.object({
  id: z.string(),
  name: z.string().min(1),
  bodyPart: z.string().optional(),
  severity: z.number().min(1).max(10),
  duration: z.string().min(1),
  description: z.string().optional(),
});

const requestSchema = z.object({
  symptoms: z.array(symptomInput).min(1),
  followUpAnswers: z.record(z.string(), z.string()).default({}),
  profile: userProfileSchema.nullable().optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'Invalid request', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await generateTriage(
    parsed.data.symptoms as Symptom[],
    parsed.data.followUpAnswers,
    (parsed.data.profile ?? null) as UserProfile | null,
    session.user.id
  );

  return Response.json(result);
}
