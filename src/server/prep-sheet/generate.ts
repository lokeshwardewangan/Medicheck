import 'server-only';
import { generateObject } from 'ai';
import { and, desc, eq, gte, inArray } from 'drizzle-orm';
import { defaultModel } from '@/server/ai';
import { withUserContext } from '@/server/db/with-user-context';
import { member, memberProfile } from '@/db/schema/household';
import {
  assessment,
  symptomEntry,
  triageResult,
} from '@/db/schema/assessment';
import { recordAiCall } from '@/server/audit/ai-logger';
import { prepSheetSchema, type PrepSheet } from '@/features/prep-sheet/lib/schema';

const MODEL_LABEL = 'gemini-1.5-flash';
const FEATURE = 'prep_sheet';
const DEFAULT_WINDOW_DAYS = 14;

const SYSTEM_PROMPT = `You generate a one-page "doctor visit prep sheet" for a patient in India.

Goal: The patient gets only 10–15 minutes with the doctor. Your output is what they hand over (or read off) at the start of the visit so nothing important is missed.

Rules:
- Use plain language. Avoid medical jargon unless explained.
- Be specific. Replace vague statements with concrete details from the patient's data.
- The chief complaint must be ONE sentence the patient could say first.
- Questions for the doctor must be SPECIFIC ("Could my chest tightness be related to my BP medicine?") not generic ("Am I OK?").
- Never invent data not present in the input. If the patient has no symptoms logged, base the prep on conditions/medications only.
- Never give a diagnosis or treatment advice. The prep sheet is descriptive, not prescriptive.`;

interface MemberContext {
  member: {
    name: string;
    relation: string;
    age: number | null;
    sex: 'male' | 'female' | 'other' | null;
  };
  conditions: string[];
  medications: string[];
  allergies: string[];
  recentSymptoms: Array<{
    name: string;
    severity: number;
    duration: string;
    description: string | null;
    recordedAt: Date;
  }>;
  recentTriageLevels: string[];
}

async function gatherContext(userId: string, memberId: string): Promise<MemberContext> {
  const cutoff = new Date(Date.now() - DEFAULT_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  return withUserContext(userId, async (tx) => {
    const memberRows = await tx.select().from(member).where(eq(member.id, memberId)).limit(1);
    const m = memberRows[0];
    if (!m) throw new Error('Member not found');

    const profileRows = await tx
      .select()
      .from(memberProfile)
      .where(eq(memberProfile.memberId, memberId))
      .limit(1);
    const p = profileRows[0];

    const recentAssessments = await tx
      .select({ id: assessment.id })
      .from(assessment)
      .where(and(eq(assessment.memberId, memberId), gte(assessment.createdAt, cutoff)))
      .orderBy(desc(assessment.createdAt))
      .limit(20);
    const assessmentIds = recentAssessments.map((a) => a.id);

    const recentSymptoms =
      assessmentIds.length > 0
        ? await tx
            .select({
              name: symptomEntry.name,
              severity: symptomEntry.severity,
              duration: symptomEntry.duration,
              description: symptomEntry.description,
              recordedAt: symptomEntry.recordedAt,
            })
            .from(symptomEntry)
            .where(inArray(symptomEntry.assessmentId, assessmentIds))
            .orderBy(desc(symptomEntry.recordedAt))
            .limit(20)
        : [];

    const recentTriages =
      assessmentIds.length > 0
        ? await tx
            .select({ level: triageResult.level })
            .from(triageResult)
            .where(inArray(triageResult.assessmentId, assessmentIds))
        : [];

    return {
      member: {
        name: m.name,
        relation: m.relation,
        age: m.age,
        sex: m.sex,
      },
      conditions: p?.existingConditions ?? [],
      medications: p?.medications ?? [],
      allergies: p?.allergies ?? [],
      recentSymptoms,
      recentTriageLevels: recentTriages.map((t) => t.level),
    };
  });
}

function buildPrompt(ctx: MemberContext): string {
  const m = ctx.member;
  const symptomList =
    ctx.recentSymptoms.length === 0
      ? 'No symptoms logged in the last 14 days.'
      : ctx.recentSymptoms
          .map(
            (s) =>
              `- ${s.recordedAt.toISOString().slice(0, 10)}: ${s.name} (severity ${s.severity}/10, duration ${s.duration})${
                s.description ? ` — ${s.description}` : ''
              }`
          )
          .join('\n');

  const triageSummary =
    ctx.recentTriageLevels.length === 0
      ? 'No prior triage results.'
      : `Recent triage levels (newest first): ${ctx.recentTriageLevels.join(', ')}`;

  return `Patient (${m.relation}): ${m.name}
Age: ${m.age ?? 'unknown'}, Sex: ${m.sex ?? 'unspecified'}

Active conditions: ${ctx.conditions.length > 0 ? ctx.conditions.join(', ') : 'None reported'}
Current medications: ${ctx.medications.length > 0 ? ctx.medications.join(', ') : 'None reported'}
Allergies: ${ctx.allergies.length > 0 ? ctx.allergies.join(', ') : 'None reported'}

Symptoms in the last ${DEFAULT_WINDOW_DAYS} days:
${symptomList}

${triageSummary}

Produce a doctor visit prep sheet for this patient. Use only the data above.`;
}

export async function generatePrepSheet(
  userId: string,
  memberId: string
): Promise<{ prepSheet: PrepSheet; memberName: string }> {
  const ctx = await gatherContext(userId, memberId);
  const prompt = buildPrompt(ctx);
  const startedAt = Date.now();

  try {
    const result = await generateObject({
      model: defaultModel,
      schema: prepSheetSchema,
      system: SYSTEM_PROMPT,
      prompt,
    });

    await recordAiCall({
      userId,
      feature: FEATURE,
      model: MODEL_LABEL,
      prompt,
      status: 'success',
      tokensIn: result.usage?.inputTokens,
      tokensOut: result.usage?.outputTokens,
      latencyMs: Date.now() - startedAt,
    });

    return { prepSheet: result.object, memberName: ctx.member.name };
  } catch (error) {
    await recordAiCall({
      userId,
      feature: FEATURE,
      model: MODEL_LABEL,
      prompt,
      status: 'error',
      latencyMs: Date.now() - startedAt,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
