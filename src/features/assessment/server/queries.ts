import 'server-only';
import { desc, eq, inArray } from 'drizzle-orm';
import { withUserContext } from '@/server/db/with-user-context';
import { assessment, symptomEntry, triageResult } from '@/db/schema/assessment';
import { member } from '@/db/schema/household';
import type { TriageLevel, NextStep } from '@/types';

export interface HistoryItem {
  assessmentId: string;
  memberId: string;
  memberName: string;
  createdAt: Date;
  symptoms: string[];
  triage: {
    level: TriageLevel;
    title: string;
    description: string;
    explanation: string[];
    nextSteps: NextStep[];
    disclaimer: string;
  } | null;
}

export async function listHistory(userId: string): Promise<HistoryItem[]> {
  return withUserContext(userId, async (tx) => {
    const assessments = await tx
      .select({
        assessmentId: assessment.id,
        memberId: assessment.memberId,
        memberName: member.name,
        createdAt: assessment.createdAt,
        status: assessment.status,
      })
      .from(assessment)
      .innerJoin(member, eq(assessment.memberId, member.id))
      .where(eq(assessment.status, 'completed'))
      .orderBy(desc(assessment.createdAt));

    if (assessments.length === 0) return [];

    const assessmentIds = assessments.map((a) => a.assessmentId);

    const symptoms = await tx
      .select({
        assessmentId: symptomEntry.assessmentId,
        name: symptomEntry.name,
      })
      .from(symptomEntry)
      .where(inArray(symptomEntry.assessmentId, assessmentIds));

    const triageRows = await tx
      .select()
      .from(triageResult)
      .where(inArray(triageResult.assessmentId, assessmentIds));

    const symptomsByAssessment = new Map<string, string[]>();
    for (const s of symptoms) {
      const list = symptomsByAssessment.get(s.assessmentId) ?? [];
      list.push(s.name);
      symptomsByAssessment.set(s.assessmentId, list);
    }

    const triageByAssessment = new Map(triageRows.map((t) => [t.assessmentId, t]));

    return assessments.map((a) => {
      const t = triageByAssessment.get(a.assessmentId);
      return {
        assessmentId: a.assessmentId,
        memberId: a.memberId,
        memberName: a.memberName,
        createdAt: a.createdAt,
        symptoms: symptomsByAssessment.get(a.assessmentId) ?? [],
        triage: t
          ? {
              level: t.level,
              title: t.title,
              description: t.description,
              explanation: t.explanation,
              nextSteps: t.nextSteps,
              disclaimer: t.disclaimer,
            }
          : null,
      } satisfies HistoryItem;
    });
  });
}
