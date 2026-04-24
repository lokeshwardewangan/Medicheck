'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { requireSession } from '@/server/auth/session';
import { withUserContext } from '@/server/db/with-user-context';
import {
  assessment,
  assessmentMessage,
  symptomEntry,
  followUpAnswer,
  triageResult,
} from '@/db/schema/assessment';
import { member, memberProfile } from '@/db/schema/household';
import { getCurrentMember } from '@/features/members/server/queries';
import { generateTriage } from '@/server/triage/generate';
import { recordPhiAccess } from '@/server/audit/phi-logger';
import type { TriageResult, UserProfile } from '@/types';

const submitInput = z.object({
  chatMessages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1),
        isEmergency: z.boolean().optional(),
      })
    )
    .default([]),
  symptoms: z
    .array(
      z.object({
        name: z.string().min(1),
        bodyPart: z.string().optional().nullable(),
        severity: z.number().int().min(1).max(10),
        duration: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .min(1),
  followUpAnswers: z.record(z.string(), z.string()).default({}),
});

export type SubmitAssessmentInput = z.input<typeof submitInput>;
export type SubmitAssessmentResult = {
  assessmentId: string;
  triage: TriageResult;
};

async function buildProfileForMember(
  userId: string,
  memberId: string
): Promise<UserProfile | null> {
  return withUserContext(userId, async (tx) => {
    const memberRows = await tx.select().from(member).where(eq(member.id, memberId)).limit(1);
    if (memberRows.length === 0) return null;
    const m = memberRows[0];

    const profileRows = await tx
      .select()
      .from(memberProfile)
      .where(eq(memberProfile.memberId, memberId))
      .limit(1);
    const p = profileRows[0];

    return {
      id: m.id,
      age: m.age ?? 0,
      sex: m.sex ?? 'other',
      existingConditions: p?.existingConditions ?? [],
      medications: p?.medications ?? [],
      allergies: p?.allergies ?? [],
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    } satisfies UserProfile;
  });
}

export async function submitAssessment(
  input: SubmitAssessmentInput
): Promise<SubmitAssessmentResult> {
  const session = await requireSession();
  const parsed = submitInput.parse(input);

  const current = await getCurrentMember(session.user.id);
  if (!current) throw new Error('No current member set');

  const profile = await buildProfileForMember(session.user.id, current.id);

  // AI call is outside the transaction — it's slow and not transactional.
  const triage = await generateTriage(
    parsed.symptoms.map((s, i) => ({
      id: `s-${i}`,
      name: s.name,
      bodyPart: s.bodyPart ?? undefined,
      severity: s.severity as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
      duration: s.duration,
      description: s.description,
    })),
    parsed.followUpAnswers,
    profile,
    session.user.id
  );

  const assessmentId = await withUserContext(session.user.id, async (tx) => {
    const [created] = await tx
      .insert(assessment)
      .values({
        memberId: current.id,
        status: 'completed',
        completedAt: new Date(),
      })
      .returning({ id: assessment.id });

    if (parsed.chatMessages.length > 0) {
      await tx.insert(assessmentMessage).values(
        parsed.chatMessages.map((m) => ({
          assessmentId: created.id,
          role: m.role,
          content: m.content,
          isEmergency: m.isEmergency ?? false,
        }))
      );
    }

    await tx.insert(symptomEntry).values(
      parsed.symptoms.map((s) => ({
        assessmentId: created.id,
        name: s.name,
        bodyPart: s.bodyPart ?? null,
        severity: s.severity,
        duration: s.duration,
        description: s.description ?? null,
      }))
    );

    const answerEntries = Object.entries(parsed.followUpAnswers);
    if (answerEntries.length > 0) {
      await tx.insert(followUpAnswer).values(
        answerEntries.map(([qId, ans]) => ({
          assessmentId: created.id,
          questionId: qId,
          question: qId,
          answer: ans,
        }))
      );
    }

    await tx.insert(triageResult).values({
      assessmentId: created.id,
      level: triage.level,
      title: triage.title,
      description: triage.description,
      explanation: triage.explanation,
      nextSteps: triage.nextSteps,
      disclaimer: triage.disclaimer,
    });

    return created.id;
  });

  await recordPhiAccess({
    userId: session.user.id,
    action: 'create',
    resourceType: 'assessment',
    resourceId: assessmentId,
    metadata: { memberId: current.id, triageLevel: triage.level },
  });

  return { assessmentId, triage };
}
